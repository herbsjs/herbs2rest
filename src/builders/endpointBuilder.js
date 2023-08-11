const { Endpoint } = require('./endpoint')
const { herbarium } = require("@herbsjs/herbarium")
const { NodeType } = require("../restEndpoint")

class EndpointBuilder {

    constructor({ herbarium, version, controller, authorizationHandler, injection }) {
        this.herbarium = herbarium
        this.version = version
        this.controller = controller
        this.authorizationHandler = authorizationHandler
        this.injection = injection
        this.ignored = []
    }

    for(usecaseID, endpointID) {
        const usecaseNode = this.herbarium.nodes.get(usecaseID)
        if (!usecaseNode) throw new Error(`Use case ${usecaseID} not found.`)
        const { version, controller, authorizationHandler, injection } = this
        const endpoint = Endpoint.for({ uc: usecaseNode, version, controller, authorizationHandler, injection })
        endpoint.id = endpointID || endpoint.id
        this.herbarium.nodes.add(endpoint.id, endpoint, NodeType)
            .link(usecaseID, herbarium.link.API)
        return endpoint
    }

    ignore(usecaseID) {
        this.ignored.push(usecaseID)
    }

    build() {
        const { herbarium, version, controller, authorizationHandler } = this

        for (let uc of herbarium.nodes.find({ type: herbarium.node.usecase })) {
            if (this.ignored.includes(uc.id)) continue
            const endpoints = uc
                .linkedTo({ type: NodeType })
                .filter(endpoint => endpoint.value.version === version)

            // If there is no endpoint for the use case, create one
            if (endpoints.length === 0) {
                const endpoint = Endpoint.for({ uc, version, injection: this.injection }).use({ controller, authorizationHandler })
                herbarium.nodes.add(endpoint.id, endpoint, NodeType)
                    .link(uc.id, herbarium.link.API)
                continue
            }
        }
    }
}

module.exports = { EndpointBuilder }