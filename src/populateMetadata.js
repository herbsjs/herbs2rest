const defaultController = require("./defaultController")
const { herbarium } = require("@herbsjs/herbarium")

const defaultConvention = {

    controller: defaultController,

    crudToVerb(crud) {
        const fromTo = {
            [herbarium.crud.read]: 'GET',
            [herbarium.crud.readAll]: 'GET',
            [herbarium.crud.create]: 'POST',
            [herbarium.crud.update]: 'PUT',
            [herbarium.crud.delete]: 'DELETE',
        }
        return fromTo[crud] || 'POST'
    },

    toResourceName(entity, group) {
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

    crudToPath(crud, resource) {
        if (!resource) return

        switch (crud) {
            case herbarium.crud.read:
                return `/${resource}/:id`
            case herbarium.crud.readAll:
                return `/${resource}`
            case herbarium.crud.create:
                return `/${resource}`
            case herbarium.crud.update:
                return `/${resource}/:id`
            case herbarium.crud.delete:
                return `/${resource}/:id`
            default:
                return `/${resource}`
        }
    },

    toRequestParams(verb, entity, params) {

        // the params comes from the use case 'request' property
        // the entity here is just to find which param is a ID, since this metadata is not in the request
        // the crud param will be used to find the params in the right source

        //source based on the verb
        const sourcesConvetions = {
            GET: { IDs: 'params', payload: 'query', },
            POST: { payload: 'body', },
            PUT: { IDs: 'params', payload: 'body', },
            DELETE: { IDs: 'params' }
        }

        //find all the IDs fields in the entity
        const entityIDs = entity ? Object.entries(entity.prototype.meta.schema).filter(([_, value]) => value?.options.isId).map(([key, _]) => key) : []

        //find all the IDs and not IDs fields in the params
        const paramsIDs = Object.entries(params).filter(([key, _]) => entityIDs.includes(key)).map(([key, _]) => key)
        const paramsNotIDs = Object.entries(params).filter(([key, _]) => !entityIDs.includes(key)).map(([key, _]) => key)

        //result is a object with the params in the right source ({ [source]: { [paramName]: [paramType] } })
        //if the verbs is not in the sourcesConvetions, the source will be 'body'
        const result = {}
        if (paramsIDs.length) {
            const source = sourcesConvetions[verb]?.IDs || 'body'
            result[source] = Object.fromEntries(paramsIDs.map(id => [id, params[id]]))
        }
        if (paramsNotIDs.length) {
            const source = sourcesConvetions[verb]?.payload || 'body'
            result[source] = Object.fromEntries(paramsNotIDs.map(id => [id, params[id]]))
        }
        return result
    }
}

function populateMetadata({ herbarium, convention, controller }) {

    convention = convention || defaultConvention

    for (let uc of herbarium.usecases.all) {
        const [ucName, info] = uc
        const crud = info.operation || herbarium.crud.other
        const entity = info.entity
        const group = info.group
        const ucRequest = { ...info.usecase().requestSchema }

        const verb = info?.REST?.verb || convention.crudToVerb(crud)
        const resource = info?.REST?.resource || convention.toResourceName(entity, group)
        const path = info?.REST?.path || convention.crudToPath(crud, resource)
        const params = info?.REST?.params || convention.toRequestParams(verb, entity, ucRequest)
        const ctlr = info?.REST?.controller || controller || convention.controller

        if (!resource) throw new Error(`It is not possible to generate a REST resource name for usecase ${ucName}. Please, add a group or entity to the usecase metadata.`)

        info.metadata({ REST: { verb, path, resource, params, controller: ctlr } })
    }

}

module.exports = { populateMetadata, convention: defaultConvention }