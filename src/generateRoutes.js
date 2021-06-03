const defaultController = require('./defaultController')

const generateRoutes = (controllerList, app, endpointInfo = false) => {
  // eslint-disable-next-line no-console
  function info(msg) { if (endpointInfo) console.info(msg) }

  info(`\n🌐 REST Endpoints`)

  controllerList.forEach(controller => {
    info(`\n${controller.name} endpoints`)

    if (controller.getAll) {
      const endpoint = `/${controller.name}`
      info(`    GET ${endpoint} -> ${controller.getAll.useCase().description}`)
      app.get(endpoint, async (req, res, next) => {
        const request = { query: req.query }
        const usecase = controller.getAll.useCase
        const currentController = controller.getAll.customController || defaultController

        await currentController(usecase, request, req.user, res, next)
      })
    }

    if (controller.getById) {
      const endpoint = `/${controller.name}/:${controller.getById.idParameter || 'id'}`
      info(`    GET ${endpoint} -> ${controller.getById.useCase().description}`)
      app.get(endpoint, async (req, res, next) => {
        const request = { query: req.query, params: req.params }
        const usecase = controller.getById.useCase
        const currentController = controller.getById.customController || defaultController

        await currentController(usecase, request, req.user, res, next)
      })
    }

    if (controller.post) {
      const endpoint = `/${controller.name}`
      info(`    POST ${endpoint} -> ${controller.post.useCase().description}`)
      app.post(endpoint, async (req, res, next) => {
        const request = { body: req.body }
        const usecase = controller.post.useCase
        const currentController = controller.post.customController || defaultController

        await currentController(usecase, request, req.user, res, next)
      })
    }

    if (controller.put) {
      const endpoint = `/${controller.name}/:${controller.put.idParameter || 'id'}`
      info(`    PUT ${endpoint} -> ${controller.put.useCase().description}`)
      app.put(endpoint, async (req, res, next) => {
        const request = { body: req.body, params: req.params }
        const usecase = controller.put.useCase
        const currentController = controller.put.customController || defaultController

        await currentController(usecase, request, req.user, res, next)
      })
    }

    if (controller.delete) {
      const endpoint = `/${controller.name}/:${controller.delete.idParameter || 'id'}`
      info(`    DELETE ${endpoint} -> ${controller.delete.useCase().description}`)
      app.delete(endpoint, async (req, res, next) => {
        const request = { params: req.params }
        const usecase = controller.delete.useCase
        const currentController = controller.delete.customController || defaultController

        await currentController(usecase, request, req.user, res, next)
      })
    }
  })
}

module.exports = generateRoutes
