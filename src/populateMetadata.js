const defaultController = require("./defaultController")
const { herbarium } = require("@herbsjs/herbarium")

const defaultConvention = {

    controller: defaultController,

    parametersHandler: (req, parameters) => {
        const result = {}

        for (let source in parameters) {
            for (const param in parameters[source]) {
                result[param] = req[source][param]
            }
        }

        return result
    },

    userHandler: (request) => request.user,

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

    toResourceName({ entity, group }) {
        const entityName = entity?.name
        const groupName = group
        let resourceName = entityName || groupName
        if (!resourceName) return
        resourceName = this.toPlural(resourceName)
        resourceName = this.toResourceNameCase(resourceName)
        return resourceName
    },

    toResourceNameCase(name) {
        // string to camelCase
        return name.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '')
    },

    toPlural(name) {
        // string to plural, english rules
        if (name.endsWith('y')) return name.slice(0, -1) + 'ies'
        if (name.endsWith('s')) return name + 'es'
        return name + 's'
    },

    methodToPath({ method, operation, resource, parameters }) {
        if (!resource) return

        const params = Object.keys(parameters?.params || {})
        const template = params.length > 0 ? `/:${params.join('/:')}` : ''

        // convetion based on HTTP method
        switch (method) {
            case 'GET':
                if (operation === herbarium.crud.readAll) return `/${resource}`
                return `/${resource}${template}`
            case 'POST':
                return `/${resource}`
            case 'PUT':
                return `/${resource}${template}`
            case 'DELETE':
                return `/${resource}${template}`
            default:
                return `/${resource}`
        }
    },

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

function populateMetadata({ herbarium, controller, convention = defaultConvention }) {
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

        const method = normalizeHTTPMethod(info?.REST?.method || convention.operationToMethod({ operation, entity, group }))
        if (!method) throw new Error(`Invalid Method. It is not possible to populate the REST metadata for usecase ${ucName}. Please, check the method on the usecase metadata.`)

        const resource = info?.REST?.resource || convention.toResourceName({ entity, group, operation })
        if (!resource) throw new Error(`Invalid Resource. It is not possible to generate a REST resource name for usecase ${ucName}. Please, add a group or entity to the usecase metadata.`)

        const parameters = info?.REST?.parameters || convention.requestToParameters({ method, entity, request: ucRequest, group, operation })
        const parametersHandler = info?.REST?.parametersHandler || convention.parametersHandler

        const path = info?.REST?.path || convention.methodToPath({ method, operation, resource, parameters, entity, group })
        const ctlr = info?.REST?.controller || controller || convention.controller

        const userHandler = info?.REST?.userHandler || convention.userHandler

        info.metadata({ REST: { method, path, resource, parameters, parametersHandler, userHandler, controller: ctlr } })
    }

}

module.exports = { populateMetadata, convention: defaultConvention }