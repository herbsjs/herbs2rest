const { herbarium } = require("@herbsjs/herbarium")
const { Path } = require("./path")
const { Parameter } = require("./parameter")
const { Resource } = require("./resource")
const { HTTPMethod } = require("./httpMethod")
const defaultController = require("../defaultController")

const defaultHandlers = {
    controller: defaultController,
    authorizationHandler(req) { return req.user },
}

const dependency = {
    HTTPMethod,
    Parameter,
    Resource,
    Path
}

class Endpoint {

    static for({ uc, version, controller, authorizationHandler, injection }) {

        const usecaseID = uc.id
        const metadatas = uc.metadatas

        // operation
        const operation = metadatas?.operation || herbarium.crud.other

        // entity
        const entities = uc.linkedTo({ type: herbarium.node.entity })
        if (entities.length > 1) throw new Error(`Invalid Use Case. The use case ${usecaseID} is linked to more than one entity.`)
        let entity = entities[0]?.value

        // request
        const request = { ...uc.value().requestSchema }

        // endpoint
        const endpoint = new Endpoint()
        endpoint.id = `${usecaseID}Endpoint${version ? `-${version}` : ''}`
        endpoint.version = version
        endpoint.controller = controller
        endpoint.authorizationHandler = authorizationHandler
        endpoint.usecase = { id: usecaseID, entity, operation, request }
        endpoint.injection = Object.assign({}, dependency, injection)
        return endpoint
    }

    use({ method, resource, parameters, parametersHandler, path, controller, authorizationHandler }) {
        this.method = method || this.method
        this.resource = resource || this.resource
        this.parameters = parameters || this.parameters
        this.parametersHandler = parametersHandler || this.parametersHandler
        this.path = path || this.path
        this.controller = controller || this.controller
        this.authorizationHandler = authorizationHandler || this.authorizationHandler
        this.#initialize()
        this.#validate()
        return this
    }

    #initialize() {
        const { HTTPMethod, Parameter, Resource, Path } = this.injection
        this.method = HTTPMethod.parse(this.method) || HTTPMethod.fromOperation(this.usecase.operation)
        this.parameters = this.parameters || new Parameter(this).build()
        this.parametersHandler = this.parametersHandler || Parameter.handler
        this.resource = this.resource || new Resource(this).build()
        this.path = this.path || new Path(this).build()
        this.controller = this.controller || defaultHandlers.controller
        this.authorizationHandler = this.authorizationHandler || defaultHandlers.authorizationHandler
        this.usecase = { id: this.usecase.id }
    }

    #validate() {
        if (!this.method) throw new Error(`It was not possible to use or infer the method for the endpoint ${this.id}`)
        if (!this.resource) throw new Error(`It was not possible to use or infer the resource name for the endpoint ${this.id}`)
        if (!this.path) throw new Error(`It was not possible to use or infer the path for the endpoint ${this.id}`)
        if (!this.controller) throw new Error(`It was not possible to use or infer the controller for the endpoint ${this.id}`)
        if (!this.authorizationHandler) throw new Error(`It was not possible to use or infer the authorizationHandler for the endpoint ${this.id}`)
        if (!this.parameters) throw new Error(`It was not possible to use or infer the parameters for the endpoint ${this.id}`)
        if (!this.parametersHandler) throw new Error(`It was not possible to use or infer the parametersHandler for the endpoint ${this.id}`)
    }

    toJSON() {
        const { Parameter } = this.injection
        const { version, method, path, parameters, resource } = this
        return { version, method, path, parameters: Parameter.toJSON(parameters), resource }
    }

}

module.exports = { Endpoint }