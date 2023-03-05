function generateRoutes(routes, app, endpointInfo = false) {
  // eslint-disable-next-line no-console
  function info(msg) { if (endpointInfo) console.info(msg) }

  info(`\n🌐 REST Endpoints`)

  routes.forEach(route => {
    info(`\n${route.name} endpoints`)

    let idFieldName = null
    if (route.entity) {
      [idFieldName] = Object.entries(route.entity.prototype.meta.schema).find(([_key, value]) => value?.options.isId) || []
    }

    const forcedPath = {
      getAll: route.getAll?.REST?.path,
      getById: route.getById?.REST?.path,
      post: route.post?.REST?.path,
      put: route.put?.REST?.path,
      delete: route.delete?.REST?.path,
    }

    const generatedPath = {
      getAll: `/${route.getAll?.REST?.resourceName || route.name}`,
      getById: `/${route.getById?.REST?.resourceName || route.name}/:${route.getById?.id || idFieldName || 'id'}`,
      post:`/${route.post?.REST?.resourceName || route.name}`,
      put: `/${route.put?.REST?.resourceName || route.name}/:${route.put?.id || idFieldName || 'id'}`,
      delete: `/${route.delete?.REST?.resourceName || route.name}/:${route.delete?.id || idFieldName || 'id'}`,
    }

    if (route.getAll) {
      const path = forcedPath.getAll || generatedPath.getAll
      info(`    GET ${path} -> ${route.getAll.usecase().description}`)
      app.get(path, async (req, res, next) => {
        const request = { query: req.query }
        const usecase = route.getAll.usecase
        const currentController = route.getAll.controller

        await currentController(usecase, request, req.user, res, next)
      })
    }

    if (route.getById) {
      const path = forcedPath.getById || generatedPath.getById
      info(`    GET ${path} -> ${route.getById.usecase().description}`)
      app.get(path, async (req, res, next) => {
        const request = { query: req.query, params: req.params }
        const usecase = route.getById.usecase
        const currentController = route.getById.controller

        await currentController(usecase, request, req.user, res, next)
      })
    }

    if (route.post) {
      const path = forcedPath.post || generatedPath.post
      info(`    POST ${path} -> ${route.post.usecase().description}`)
      app.post(path, async (req, res, next) => {
        const request = { body: req.body }
        const usecase = route.post.usecase
        const currentController = route.post.controller

        await currentController(usecase, request, req.user, res, next)
      })
    }

    if (route.put) {
      const path = forcedPath.put || generatedPath.put
      info(`    PUT ${path} -> ${route.put.usecase().description}`)
      app.put(path, async (req, res, next) => {
        const request = { body: req.body, params: req.params }
        const usecase = route.put.usecase
        const currentController = route.put.controller

        await currentController(usecase, request, req.user, res, next)
      })
    }

    if (route.delete) {
      const path = forcedPath.delete || generatedPath.delete
      info(`    DELETE ${path} -> ${route.delete.usecase().description}`)
      app.delete(path, async (req, res, next) => {
        const request = { params: req.params }
        const usecase = route.delete.usecase
        const currentController = route.delete.controller

        await currentController(usecase, request, req.user, res, next)
      })
    }

    if (route.other) route.other.forEach((other) => {
      if (other.REST?.path || other.REST?.resourceName) {
        const path = other.REST?.path || `/${other.REST?.resourceName}`
        const verb = other.REST?.verb?.toLowerCase() || 'post'
        info(`    ${verb.toUpperCase()} ${path} -> ${other.usecase().description}`)
        app[verb](path, async (req, res, next) => {
          const request = { body: req.body, query: req.query, params: req.params }
          const usecase = other.usecase
          const currentController = other.controller

          await currentController(usecase, request, req.user, res, next)
        })
      }
    })
  })
}

module.exports = generateRoutes
