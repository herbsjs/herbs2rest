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

    const forcedPath = getForcedPath(route)

    const generatedPath = {
      getAll: `/${route.getAll?.REST?.resourceName || route.name}`,
      getById: `/${route.getById?.REST?.resourceName || route.name}/:${route.getById?.id || idFieldName || 'id'}`,
      post: `/${route.post?.REST?.resourceName || route.name}`,
      put: `/${route.put?.REST?.resourceName || route.name}/:${route.put?.id || idFieldName || 'id'}`,
      delete: `/${route.delete?.REST?.resourceName || route.name}/:${route.delete?.id || idFieldName || 'id'}`,
    }

    if (route.getAll) {
      const path = forcedPath.getAll?.path || generatedPath.getAll
      const verb = forcedPath.getAll?.verb || 'get'
      info(`    ${verb.toUpperCase()} ${path} -> ${route.getAll.usecase().description}`)
      app[verb](path, async (req, res, next) => {
        const request = { query: req.query }
        const usecase = route.getAll.usecase
        const currentController = route.getAll.controller

        await currentController(usecase, request, req.user, res, next)
      })
    }

    if (route.getById) {
      const path = forcedPath.getById?.path || generatedPath.getById
      const verb = forcedPath.getById?.verb || 'get'
      info(`    ${verb.toUpperCase()} ${path} -> ${route.getById.usecase().description}`)
      app[verb](path, async (req, res, next) => {
        const request = { query: req.query, params: req.params }
        const usecase = route.getById.usecase
        const currentController = route.getById.controller

        await currentController(usecase, request, req.user, res, next)
      })
    }

    if (route.post) {
      const path = forcedPath.post?.path || generatedPath.post
      const verb = forcedPath.post?.verb || 'post'
      info(`    ${verb.toUpperCase()} ${path} -> ${route.post.usecase().description}`)
      app[verb](path, async (req, res, next) => {
        const request = { body: req.body }
        const usecase = route.post.usecase
        const currentController = route.post.controller

        await currentController(usecase, request, req.user, res, next)
      })
    }

    if (route.put) {
      const path = forcedPath.put?.path || generatedPath.put
      const verb = forcedPath.put?.verb || 'put'
      info(`    ${verb.toUpperCase()} ${path} -> ${route.put.usecase().description}`)
      app[verb](path, async (req, res, next) => {
        const request = { body: req.body, params: req.params }
        const usecase = route.put.usecase
        const currentController = route.put.controller

        await currentController(usecase, request, req.user, res, next)
      })
    }

    if (route.delete) {
      const path = forcedPath.delete?.path || generatedPath.delete
      const verb = forcedPath.delete?.verb || 'delete'
      info(`    ${verb.toUpperCase()} ${path} -> ${route.delete.usecase().description}`)
      app[verb](path, async (req, res, next) => {
        const request = { params: req.params }
        const usecase = route.delete.usecase
        const currentController = route.delete.controller

        await currentController(usecase, request, req.user, res, next)
      })
    }

    if (route.other) route.other.forEach((other) => {
      let path
      let resourceName
      const verb = getVerb(other?.REST) || 'post'
      if (other.REST?.resourceName) {
        resourceName = `/${other.REST?.resourceName}`
      }
      if (other.REST) {
        path = other.REST[verb] || resourceName
      }
      if (path) {
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

function getForcedPath(route) {
  const forcedPaths = {}

  const verbs = {
    getAll: getVerb(route.getAll?.REST),
    getById: getVerb(route.getById?.REST),
    post: getVerb(route.post?.REST),
    put: getVerb(route.put?.REST),
    delete: getVerb(route.delete?.REST)
  }

  if (verbs.getAll) {
    const verb = verbs.getAll
    const pathAndVerb = {
      verb,
      path: route.getAll.REST[verb]
    }
    forcedPaths.getAll = pathAndVerb
  }

  if (verbs.getById) {
    const verb = verbs.getById
    const pathAndVerb = {
      verb,
      path: route.getById.REST[verb]
    }
    forcedPaths.getById = pathAndVerb
  }

  if (verbs.post) {
    const verb = verbs.post
    const pathAndVerb = {
      verb,
      path: route.post.REST[verb]
    }
    forcedPaths.post = pathAndVerb
  }

  if (verbs.put) {
    const verb = verbs.put
    const pathAndVerb = {
      verb,
      path: route.put.REST[verb]
    }
    forcedPaths.put = pathAndVerb
  }

  if (verbs.delete) {
    const verb = verbs.delete
    const pathAndVerb = {
      verb,
      path: route.delete.REST[verb]
    }
    forcedPaths.delete = pathAndVerb
  }

  return forcedPaths
}

function getVerb(REST) {
  if (REST != undefined) {
    const keys = Object.keys(REST)
    const verb = keys.find((key) => {
      return (key == 'get' || key == 'post' || key == 'put' || key == 'delete')
    })

    if (verb != undefined) return verb
  }

  return undefined
}

module.exports = generateRoutes
