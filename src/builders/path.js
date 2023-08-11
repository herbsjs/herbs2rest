const { herbarium } = require("@herbsjs/herbarium")

class Path {
    constructor({ version, method, usecase: { operation }, resource, parameters }) {
        this.version = version
        this.method = method
        this.operation = operation
        this.resource = resource
        this.parameters = parameters
    }

    build() {
        const version = this.version
        const method = this.method
        const operation = this.operation
        const resource = this.resource
        const parameters = this.parameters

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
    }
}

module.exports = { Path }