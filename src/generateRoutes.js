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

    const customEndpoints = {
      getAll: route.getAll?.REST?.path,
      getById: route.getById?.REST?.path ? `${route.getById.REST?.path}/:${route.getById.id || idFieldName || route.idEntity || 'id'}` : undefined,
      post: route.post?.REST?.path,
      put: route.put?.REST?.path ? `${route.put.REST?.path}/:${route.put.id || idFieldName || 'id'}` : undefined,
      delete: route.delete?.REST?.path ? `${route.delete.REST?.path}/:${route.delete.id || idFieldName || 'id'}` : undefined,
    }

    if (route.getAll) {
      const endpoint = customEndpoints.getAll || `/${route.name}/`
      info(`    GET ${endpoint} -> ${route.getAll.usecase().description}`)
      app.get(endpoint, async (req, res, next) => {
        const request = { query: req.query }
        const usecase = route.getAll.usecase
        const currentController = route.getAll.controller

        await currentController(usecase, request, req.user, res, next)
      })
    }

    if (route.getById) {
      const endpoint = customEndpoints.getById ? customEndpoints.getById : `/${route.name}/:${route.getById.id || idFieldName || route.idEntity || 'id'}`
      info(`    GET ${endpoint} -> ${route.getById.usecase().description}`)
      app.get(endpoint, async (req, res, next) => {
        const request = { query: req.query, params: req.params }
        const usecase = route.getById.usecase
        const currentController = route.getById.controller

        await currentController(usecase, request, req.user, res, next)
      })
    }

    if (route.post) {
      const endpoint = customEndpoints.post || `/${route.name}`
      info(`    POST ${endpoint} -> ${route.post.usecase().description}`)
      app.post(endpoint, async (req, res, next) => {
        const request = { body: req.body }
        const usecase = route.post.usecase
        const currentController = route.post.controller

        await currentController(usecase, request, req.user, res, next)
      })
    }

    if (route.put) {
      const endpoint = customEndpoints.put || `/${route.name}/:${route.put.id || idFieldName || 'id'}`
      info(`    PUT ${endpoint} -> ${route.put.usecase().description}`)
      app.put(endpoint, async (req, res, next) => {
        const request = { body: req.body, params: req.params }
        const usecase = route.put.usecase
        const currentController = route.put.controller

        await currentController(usecase, request, req.user, res, next)
      })
    }

    if (route.delete) {
      const endpoint = customEndpoints.delete || `/${route.name}/:${route.delete.id || idFieldName || 'id'}`
      info(`    DELETE ${endpoint} -> ${route.delete.usecase().description}`)
      app.delete(endpoint, async (req, res, next) => {
        const request = { params: req.params }
        const usecase = route.delete.usecase
        const currentController = route.delete.controller

        await currentController(usecase, request, req.user, res, next)
      })
    }

    if (route.other) route.other.forEach((other) => {
      if (other.REST?.verb && other.REST?.path) {
        const endpoint = `${other.REST.path}`
        const verb = other.REST.verb.toLowerCase()
        info(`    OTHER ${other.REST.verb} ${endpoint} -> ${other.usecase().description}`)
        app[verb](endpoint, async (req, res, next) => {
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
