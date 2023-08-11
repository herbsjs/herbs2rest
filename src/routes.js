
const { RouteBuilder } = require("./builders/routeBuilder")
const { NodeType } = require("./restEndpoint")

function routes({ herbarium, server }) {
    return new RouteBuilder({ herbarium, server })
}

module.exports = { routes }