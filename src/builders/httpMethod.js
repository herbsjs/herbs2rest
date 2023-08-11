const { herbarium } = require("@herbsjs/herbarium")

class HTTPMethod {
    static methods = {
        GET: 'GET',
        POST: 'POST',
        PUT: 'PUT',
        DELETE: 'DELETE',
        PATCH: 'PATCH',
        OPTIONS: 'OPTIONS',
        HEAD: 'HEAD',
        TRACE: 'TRACE',
        CONNECT: 'CONNECT'
    }

    static operationToMethod = {
        [herbarium.crud.read]: HTTPMethod.methods.GET,
        [herbarium.crud.readAll]: HTTPMethod.methods.GET,
        [herbarium.crud.create]: HTTPMethod.methods.POST,
        [herbarium.crud.update]: HTTPMethod.methods.PUT,
        [herbarium.crud.delete]: HTTPMethod.methods.DELETE,
    }

    static isHTTPMethod(method) {
        return Object.values(HTTPMethod.methods).includes(method)
    }

    static parse(method) {
        if (typeof method !== 'string') return
        let normalized = method.toUpperCase()
        if (this.isHTTPMethod(normalized)) return normalized
        throw new Error(`Invalid HTTP method: ${method}`)
    }

    static fromOperation(operation) {
        return HTTPMethod.operationToMethod[operation] || HTTPMethod.methods.POST
    }
}

module.exports = { HTTPMethod }