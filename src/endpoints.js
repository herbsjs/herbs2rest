const { EndpointBuilder } = require("./builders/endpointBuilder")
const { NodeType } = require("./restEndpoint")

function endpoints({ herbarium, controller, authorizationHandler, injection }, versions) {
    if(!herbarium) throw new Error("Herbarium is required")
    
    for (let version in versions) {
        versions[version](new EndpointBuilder({ herbarium, version, controller, authorizationHandler, injection }))
    }
}

endpoints.NodeType = NodeType

module.exports = { endpoints }