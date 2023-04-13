const defaultController = require("./defaultController")
const { herbarium } = require("@herbsjs/herbarium")
const { entity, tryParse } = require("@herbsjs/herbs")

const defaultConvention = {

    controller: defaultController,

    /**
     * Extract parameters from request using the corresponding source and cast them to the corresponding type
     * @param {Request} req - Express request
     * @param {Object} parameters - Parameters to be extracted from request in the form { source: { name: type } }. Sources can be: query, params, body, headers, cookies, etc.
     * @returns {Object} - Object with parameters extracted from request in the form { name: value }
     */
    parametersHandler(req, parameters) {
        const result = {}
        for (let source in parameters) {
            for (const param in parameters[source]) {
                const type = parameters[source][param]
                const value = req[source][param]
                result[param] = defaultConvention.parametersCast(value, type)
            }
        }
        return result
    },

    /**
     * Cast request parameters (string) to the corresponding type
     * @param {String} value - Parameter value
     * @param {Object} type - Parameter type
     * @returns {Object} - Parameter value casted to the corresponding type
     */
    parametersCast(value, type) {
        if (Array.isArray(type)) return value.map(item => defaultConvention.parametersCast(item, type[0]))
        if (entity.isEntity(type)) return Object.assign(new type(), value)
        return tryParse(value, type)
    },

    /**
     * Extract authorization info from request
     * @param {Request} req - Express request
     * @returns {Object} - Object with authorization info
    */
    authorizationHandler(req) { return req.authInfo },

    /**
     * Convert CRUD operation to HTTP method
     * @param {Object} options
     * @param {herbarium.crud} options.operation - CRUD operation
     * @returns {String} - HTTP method
     */
    operationToMethod({ operation }) {
        const fromTo = {
            [herbarium.crud.read]: 'GET',
            [herbarium.crud.readAll]: 'GET',
            [herbarium.crud.create]: 'POST',
            [herbarium.crud.update]: 'PUT',
            [herbarium.crud.delete]: 'DELETE',
        }
        return fromTo[operation] || 'POST'
    },

    /**
     * Apply convention to convert entity name or group name to resource name
     * @param {Object} options
     * @param {Object} options.entity - Entity class
     * @param {String} options.group - Group name
     * @returns {String} - Resource name
     */
    toResourceName({ entity, group }) {
        const entityName = entity?.name
        const groupName = group
        let resourceName = entityName || groupName
        if (!resourceName) return
        resourceName = this.toPlural(resourceName)
        resourceName = this.toResourceNameCase(resourceName)
        return resourceName
    },

    /**
     * Transform resource name to camelCase
     * @param {String} name - Resource name
     * @returns {String} - Resource name in camelCase
     */
    toResourceNameCase(name) {
        // string to camelCase
        return name.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
            return index === 0 ? word.toLowerCase() : word.toUpperCase()
        }).replace(/\s+/g, '')
    },

    /**
     * Transform a string to plural
     * @param {String} name - Resource name
     * @returns {String} - Resource name in plural
     */
    toPlural(name) {
        // string to plural, english rules
        if (name.endsWith('y')) return name.slice(0, -1) + 'ies'
        if (name.endsWith('s')) return name + 'es'
        return name + 's'
    },

    /**
     * Convert HTTP method and CRUD operation to path
     * @param {Object} options
     * @param {String} options.method - HTTP method
     * @param {herbarium.crud} options.operation - CRUD operation
     * @param {String} options.resource - Resource name
     * @param {Object} options.parameters - Parameters to be extracted from request in the form { source: { name: type } }
     * @return {String} - Path
     */
    methodToPath({ version, method, operation, resource, parameters }) {
        if (!resource) return
        const params = Object.keys(parameters?.params || {})
        const template = params.length > 0 ? `/:${params.join('/:')}` : ''
        const versionPrefix = version ? `/${version}` : ''

        // convetion based on HTTP method
        switch (method) {
            case 'GET':
                if (operation === herbarium.crud.readAll) return `${versionPrefix}/${resource}`
                return `${versionPrefix}/${resource}${template}`
            case 'POST':
                return `${versionPrefix}/${resource}`
            case 'PUT':
                return `${versionPrefix}/${resource}${template}`
            case 'DELETE':
                return `${versionPrefix}/${resource}${template}`
            default:
                return `${versionPrefix}/${resource}`
        }
    },

    /**
     * @param {String} method - HTTP method
     * @param {Object} entity - Entity class to extract the schema, specially the ID fields
     * @param {Object} request - Request object
     * @returns {Object} - Parameters to be extracted from request in the form { source: { name: type } }
     * @example
     * requestToParameters({ method: 'GET', entity: User, request: { id: Number, name: String } })
     * // { params: { id: Number }, query: { name: String } }
     */
    requestToParameters({ method, entity, request }) {
        // the entity here is just to find which param is a ID, since this metadata is not in the request

        //source based on the method
        const sourcesConvetions = {
            GET: { IDs: 'params', payload: 'query', },
            POST: { payload: 'body', },
            PUT: { IDs: 'params', payload: 'body', },
            DELETE: { IDs: 'params' }
        }

        //find all the IDs fields in the entity
        const entityIDs = entity ? Object.entries(entity.prototype.meta.schema).filter(([_, value]) => value?.options.isId).map(([key, _]) => key) : []

        //find all the IDs and not IDs fields in the params
        const parametersIDs = Object.entries(request).filter(([key, _]) => entityIDs.includes(key)).map(([key, _]) => key)
        const parametersNotIDs = Object.entries(request).filter(([key, _]) => !entityIDs.includes(key)).map(([key, _]) => key)

        //result is a object with the params in the right source ({ [source]: { [paramName]: [paramType] } })
        //if the methods is not in the sourcesConvetions, the source will be 'body'
        const result = {}
        if (parametersIDs.length) {
            const source = sourcesConvetions[method]?.IDs || 'body'
            result[source] = Object.fromEntries(parametersIDs.map(id => [id, request[id]]))
        }
        if (parametersNotIDs.length) {
            const source = sourcesConvetions[method]?.payload || 'body'
            result[source] = Object.fromEntries(parametersNotIDs.map(id => [id, request[id]]))
        }
        return result
    }
}
/**
 * Populate the REST metadata in the use cases of the herbarium based on the convention
 * @param {Object} options
 * @param {Herbarium} options.herbarium - Herbarium instance containing the use cases
 * @param {Object} options.controller - Controller function to be used in all endpoints generated
 * @param {Object} options.convention - Convention to be used to populate the metadata and generate the endpoints
 * @returns {Herbarium} - Herbarium instance with the REST metadata populated
 */
function populateMetadata({ herbarium, controller, version = '', convention = defaultConvention }) {
    if (!herbarium) throw new Error('herbarium is required')

    function normalizeHTTPMethod(method) {
        let normalized = ''
        if (typeof method === 'string') normalized = method.toUpperCase()
        if (['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD', 'TRACE', 'CONNECT'].includes(normalized)) return normalized
        return
    }

    for (let uc of herbarium.usecases.all) {
        const [ucName, info] = uc
        const operation = info.operation || herbarium.crud.other
        const entity = info.entity
        const group = info.group
        const ucRequest = { ...info.usecase().requestSchema }

        const versioning = info?.REST?.version || version

        const method = normalizeHTTPMethod(info?.REST?.method || convention.operationToMethod({ operation, entity, group }))
        if (!method) throw new Error(`Invalid Method. It is not possible to populate the REST metadata for usecase ${ucName}. Please, check the method on the usecase metadata.`)

        const resource = info?.REST?.resource || convention.toResourceName({ entity, group, operation })
        if (!resource) throw new Error(`Invalid Resource. It is not possible to generate a REST resource name for usecase ${ucName}. Please, add a group or entity to the usecase metadata.`)

        const parameters = info?.REST?.parameters || convention.requestToParameters({ method, entity, request: ucRequest, group, operation })
        const parametersHandler = info?.REST?.parametersHandler || convention.parametersHandler

        const path = info?.REST?.path || convention.methodToPath({ version: versioning, method, operation, resource, parameters, entity, group })
        const ctlr = info?.REST?.controller || controller || convention.controller

        const authorizationHandler = info?.REST?.authorizationHandler || convention.authorizationHandler

        info.metadata({ REST: { version: versioning, method, path, resource, parameters, parametersHandler, authorizationHandler, controller: ctlr } })
    }

}

module.exports = { populateMetadata, convention: defaultConvention }