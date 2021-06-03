const defaultController = require('./defaultController')

const generateRoutes = (routes, app, endpointInfo = false) => {
  // eslint-disable-next-line no-console
  function info(msg) { if (endpointInfo) console.info(msg) }

  info(`\n🌐 REST Endpoints`)

  routes.forEach(route => {
    info(`\n${route.name} endpoints`)

    if (route.getAll) {
      const endpoint = `/${route.name}`
      info(`    GET ${endpoint} -> ${route.getAll.usecase().description}`)
      app.get(endpoint, async (req, res, next) => {
        const request = { query: req.query }
        const usecase = route.getAll.usecase
        const currentController = route.getAll.controller || defaultController

        await currentController(usecase, request, req.user, res, next)
      })
    }

    if (route.getById) {
      const endpoint = `/${route.name}/:${route.getById.id || 'id'}`
      info(`    GET ${endpoint} -> ${route.getById.usecase().description}`)
      app.get(endpoint, async (req, res, next) => {
        const request = { query: req.query, params: req.params }
        const usecase = route.getById.usecase
        const currentController = route.getById.controller || defaultController

        await currentController(usecase, request, req.user, res, next)
      })
    }

    if (route.post) {
      const endpoint = `/${route.name}`
      info(`    POST ${endpoint} -> ${route.post.usecase().description}`)
      app.post(endpoint, async (req, res, next) => {
        const request = { body: req.body }
        const usecase = route.post.usecase
        const currentController = route.post.controller || defaultController

        await currentController(usecase, request, req.user, res, next)
      })
    }

    if (route.put) {
      const endpoint = `/${route.name}/:${route.put.id || 'id'}`
      info(`    PUT ${endpoint} -> ${route.put.usecase().description}`)
      app.put(endpoint, async (req, res, next) => {
        const request = { body: req.body, params: req.params }
        const usecase = route.put.usecase
        const currentController = route.put.controller || defaultController

        await currentController(usecase, request, req.user, res, next)
      })
    }

    if (route.delete) {
      const endpoint = `/${route.name}/:${route.delete.id || 'id'}`
      info(`    DELETE ${endpoint} -> ${route.delete.usecase().description}`)
      app.delete(endpoint, async (req, res, next) => {
        const request = { params: req.params }
        const usecase = route.delete.usecase
        const currentController = route.delete.controller || defaultController

        await currentController(usecase, request, req.user, res, next)
      })
    }
  })
}

module.exports = generateRoutes
