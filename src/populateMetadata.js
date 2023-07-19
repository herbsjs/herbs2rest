const defaultController = require("./defaultController")
const { herbarium } = require("@herbsjs/herbarium")
const { entity, tryParse } = require("@herbsjs/herbs")

const defaultConvention = {

    controller: defaultController,

    /**
     * Extract parameters from request using the corresponding source and cast them to the corresponding type
     * @param {Function} usecase - Use case to be called by the controller
     * @param {Request} req - Express request
     * @param {Object} parameters - Parameters to be extracted from request in the form { source: { name: type } }. Sources can be: query, params, body, headers, cookies, etc.
     * @returns {Object} - Object with parameters extracted from request in the form { name: value }
     */
    parametersHandler(usecase, req, parameters) {
        const result = {}
        for (let source in parameters) {
            for (const param in parameters[source]) {
                const type = parameters[source][param]
                const value = req[source][param]
                result[param] = defaultConvention.parametersCast(value, type)
            }
        }
        // convert all parameters to the same type as the use case request schema
        const uc = usecase()
        for (const param in result) {
            result[param] = defaultConvention.parametersCast(result[param], uc.requestSchema[param])
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
        if (Array.isArray(type)) return value?.map(item => defaultConvention.parametersCast(item, type[0]))
        if (entity.isEntity(type) && value) return type.fromJSON(value)
        return tryParse(value, type)
    },

    /**
     * Extract authorization info from request
     * @param {Request} req - Express request
     * @returns {Object} - Object with authorization info
    */
    authorizationHandler(req) { return req.user },

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
    requestToParameters({ method, entityWithIDs, request }) {
        // the entity here is just to find which param is a ID, since this metadata is not in the request

        //source based on the method
        const sourcesConvetions = {
            GET: { IDs: 'params', payload: 'query', },
            POST: { payload: 'body', },
            PUT: { IDs: 'params', payload: 'body', },
            DELETE: { IDs: 'params' }
        }

        const requestToParameters = Object.fromEntries(Object.entries(request).map(([key, type]) => {
            function fromEntity(type) {
                if (!entity.isEntity(type)) return [key, type]
                // only the ID fields are extracted from the entity
                const entityIDs = type.schema.fields
                    .filter(field => typeof field !== 'function') // ignore methods
                    .filter(field => field.options.isId) // only the ID fields
                    .map(field => [field.name, field.type])
                return [key, Object.fromEntries(entityIDs)]
            }
            if (Array.isArray(type)) {
                const typedArray = fromEntity(type[0])
                return [key, [typedArray[1]]]
            }
            return fromEntity(type)
        }))

        //find all the IDs fields in the entity
        const entityIDs = entityWithIDs ?
            Object.entries(entityWithIDs.prototype.meta.schema)
                .filter(([_, value]) => typeof value !== 'function') // ignore methods
                .filter(([_, value]) => value?.options.isId) // only the ID fields
                .map(([key, _]) => key) : []

        //find all the IDs and not IDs fields in the params
        const parametersIDs = Object.entries(requestToParameters).filter(([key, _]) => entityIDs.includes(key)).map(([key, _]) => key)
        const parametersNotIDs = Object.entries(requestToParameters).filter(([key, _]) => !entityIDs.includes(key)).map(([key, _]) => key)

        //result is a object with the params in the right source ({ [source]: { [paramName]: [paramType] } })
        const result = {}
        if (parametersIDs.length) {
            const source = sourcesConvetions[method]?.IDs || 'body'
            result[source] = Object.fromEntries(parametersIDs.map(id => [id, requestToParameters[id]]))
        }
        if (parametersNotIDs.length) {
            const source = sourcesConvetions[method]?.payload || 'body'
            result[source] = Object.fromEntries(parametersNotIDs.map(id => [id, requestToParameters[id]]))
        }
        return result
    }
}
/**
 * Populate the REST metadata in the use cases of the herbarium based on the convention
 * @param {Object} options
 * @param {Herbarium} options.herbarium - Herbarium instance containing the use cases (required)
 * @param {Object} options.controller - Controller function to be used in all endpoints generated
 * @param {String} options.version - Version to be used in all endpoints generated
 * @param {Object} options.convention - Convention to be used to populate the metadata and generate the endpoints
 * @returns {Herbarium} - Herbarium instance with the REST metadata populated
 */
function populateMetadata({ herbarium, controller, version = '', convention = defaultConvention, authorizationHandler }) {
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

        // ignore if REST is false
        if (info?.REST === false) continue

        // throw if REST is defined and is not an array
        if (info?.REST && !Array.isArray(info.REST)) throw new Error(`Invalid REST metadata. The REST metadata for usecase ${ucName} is not an array.`)

        const REST = info?.REST || []

        // if the REST array has no elements with the version passed, add a entry with the version
        // avoid when REST is false
        if (!REST.some(metadata => metadata.version === version)) REST.push({ version })

        for (let metadata of REST) {

            const versioning = metadata?.version || version

            const method = normalizeHTTPMethod(metadata?.method || convention.operationToMethod({ operation, entity, group }))
            if (!method) throw new Error(`Invalid Method. It is not possible to populate the REST metadata for usecase ${ucName}. Please, check the method on the usecase metadata.`)

            const resource = metadata?.resource || convention.toResourceName({ entity, group, operation })
            if (!resource) throw new Error(`Invalid Resource. It is not possible to generate a REST resource name for usecase ${ucName}. Please, add a group or entity to the usecase metadata.`)

            const parameters = metadata?.parameters || convention.requestToParameters({ method, entityWithIDs: entity, request: ucRequest, group, operation })
            const parametersHandler = metadata?.parametersHandler || convention.parametersHandler

            const path = metadata?.path || convention.methodToPath({ version: versioning, method, operation, resource, parameters, entity, group })
            const ctlr = metadata?.controller || controller || convention.controller

            const authHandler = metadata?.authorizationHandler || authorizationHandler || convention.authorizationHandler

            metadata = Object.assign(metadata, { version: versioning, method, path, resource, parameters, parametersHandler, authorizationHandler: authHandler, controller: ctlr })
        }
        info.metadata({ REST })
    }

}

populateMetadata.convention = defaultConvention

module.exports = { populateMetadata }