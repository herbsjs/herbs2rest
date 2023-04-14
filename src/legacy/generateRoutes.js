function generateRoutes(routes, app, endpointInfo = false) {

  // eslint-disable-next-line no-console
  console.warn(`⚠️  'generateRoutes' function is deprecated. Use the 'generateEndpoints' function instead.`)

  // eslint-disable-next-line no-console
  function info(msg) { if (endpointInfo) console.info(msg) }

  info(`\n🌐 REST Endpoints`)

  routes.forEach(route => {
    info(`\n${route.name} endpoints`)

    let idFieldName = null
    if(route.entity){
      [idFieldName] = Object.entries(route.entity.prototype.meta.schema).find(([_key, value]) => value?.options.isId) || []
    }

    if (route.getAll) {
      const endpoint = `/${route.name}`
      info(`    GET ${endpoint} -> ${route.getAll.usecase().description}`)
      app.get(endpoint, async (req, res, next) => {
        const request = { query: req.query }
        const usecase = route.getAll.usecase
        const currentController = route.getAll.controller

        await currentController(usecase, request, req.user, res, next)
      })
    }

    if (route.getById) {
      const endpoint = `/${route.name}/:${route.getById.id || idFieldName || route.idEntity || 'id'}`
      info(`    GET ${endpoint} -> ${route.getById.usecase().description}`)
      app.get(endpoint, async (req, res, next) => {
        const request = { query: req.query, params: req.params }
        const usecase = route.getById.usecase
        const currentController = route.getById.controller

        await currentController(usecase, request, req.user, res, next)
      })
    }

    if (route.post) {
      const endpoint = `/${route.name}`
      info(`    POST ${endpoint} -> ${route.post.usecase().description}`)
      app.post(endpoint, async (req, res, next) => {
        const request = { body: req.body }
        const usecase = route.post.usecase
        const currentController = route.post.controller

        await currentController(usecase, request, req.user, res, next)
      })
    }

    if (route.put) {
      const endpoint = `/${route.name}/:${route.put.id || idFieldName || 'id'}`
      info(`    PUT ${endpoint} -> ${route.put.usecase().description}`)
      app.put(endpoint, async (req, res, next) => {
        const request = { body: req.body, params: req.params }
        const usecase = route.put.usecase
        const currentController = route.put.controller

        await currentController(usecase, request, req.user, res, next)
      })
    }

    if (route.delete) {
      const endpoint = `/${route.name}/:${route.delete.id || idFieldName || 'id'}`
      info(`    DELETE ${endpoint} -> ${route.delete.usecase().description}`)
      app.delete(endpoint, async (req, res, next) => {
        const request = { params: req.params }
        const usecase = route.delete.usecase
        const currentController = route.delete.controller

        await currentController(usecase, request, req.user, res, next)
      })
    }
  })
}

module.exports = generateRoutes