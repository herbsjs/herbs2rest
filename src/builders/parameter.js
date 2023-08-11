const { entity, tryParse } = require("@herbsjs/herbs")

class Parameter {
    constructor({ method, usecase: { request, entity } }) {
        this.method = method
        // the entity here is just to find which param is a ID, since this metadata is not in the request
        this.entity = entity
        this.request = request
    }

    //source based on the method
    static sourcesConvetions = {
        GET: { IDs: 'params', payload: 'query', },
        POST: { payload: 'body', },
        PUT: { IDs: 'params', payload: 'body', },
        DELETE: { IDs: 'params' }
    }

    build() {

        const requestToParameters = Object.fromEntries(Object.entries(this.request).map(([key, type]) => {
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
        const entityIDs = this.entity ?
            Object.entries(this.entity.prototype.meta.schema)
                .filter(([_, value]) => typeof value !== 'function') // ignore methods
                .filter(([_, value]) => value?.options.isId) // only the ID fields
                .map(([key, _]) => key) : []

        //find all the IDs and not IDs fields in the params
        const parametersIDs = Object.entries(requestToParameters).filter(([key, _]) => entityIDs.includes(key)).map(([key, _]) => key)
        const parametersNotIDs = Object.entries(requestToParameters).filter(([key, _]) => !entityIDs.includes(key)).map(([key, _]) => key)

        //result is a object with the params in the right source ({ [source]: { [paramName]: [paramType] } })
        const result = {}
        if (parametersIDs.length) {
            const source = Parameter.sourcesConvetions[this.method]?.IDs || 'body'
            result[source] = Object.fromEntries(parametersIDs.map(id => [id, requestToParameters[id]]))
        }
        if (parametersNotIDs.length) {
            const source = Parameter.sourcesConvetions[this.method]?.payload || 'body'
            result[source] = Object.fromEntries(parametersNotIDs.map(id => [id, requestToParameters[id]]))
        }
        return result
    }

    static handler(usecase, req, parameters) {
        const result = {}
        for (let source in parameters) {
            for (const param in parameters[source]) {
                const type = parameters[source][param]
                const value = req[source][param]
                result[param] = Parameter.cast(value, type)
            }
        }
        // convert all parameters to the same type as the use case request schema
        const uc = usecase()
        for (const param in result) {
            result[param] = Parameter.cast(result[param], uc.requestSchema[param])
        }
        return result
    }

    static cast(value, type) {
        if (Array.isArray(type)) {
            const toArray = value => Array.isArray(value) ? value : [value]
            return toArray(value).map(item => Parameter.cast(item, type[0]))
        }
        if (entity.isEntity(type) && value) return type.fromJSON(value)
        return tryParse(value, type)
    }

    static toJSON(parameters) {

        function stringifyValue(value) {
            if (Array.isArray(value)) return [stringifyObj(value[0])]
            if (typeof value === 'object') return stringifyObj(value)
            return value.name
        }

        function stringifyObj(obj) {
            if (typeof obj !== 'object') return stringifyValue(obj)
            const result = {}
            for (const key in obj) {
                result[key] = stringifyValue(obj[key])
            }
            return result
        }

        return stringifyObj(parameters)
    }
}

module.exports = { Parameter }