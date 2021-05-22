const defaultController = require('./defaultController')

const generateRoutes = (controllerList, app, endpointInfo = false) => {
  // eslint-disable-next-line no-console
  function info(msg) { if (endpointInfo) console.info(msg) }

  info(`\n🌐 REST Endpoints`)

  controllerList.forEach(controller => {
    info(`\n${controller.name} endpoints`)

    if (controller.getAll) {
      const endpoint = `/${controller.name}`
      info(`    GET ${endpoint} -> ${controller.getAll().description}`)
      app.get(endpoint, async (req, res, next) => {
        const request = req.query
        const usecase = controller.getAll
        await defaultController(usecase, request, req.user, res, next)
      })
    }

    if (controller.getById) {
      const endpoint = `/${controller.name}/:${controller.idParameter || 'id'}`
      info(`    GET ${endpoint} -> ${controller.getById().description}`)
      app.get(endpoint, async (req, res, next) => {
        const request = Object.assign({}, req.query, req.params)
        const usecase = controller.getById
        await defaultController(usecase, request, req.user, res, next)
      })
    }

    if (controller.post) {
      const endpoint = `/${controller.name}`
      info(`    POST ${endpoint} -> ${controller.post().description}`)
      app.post(endpoint, async (req, res, next) => {
        const request = req.body
        const usecase = controller.post
        await defaultController(usecase, request, req.user, res, next)
      })
    }

    if (controller.put) {
      const endpoint = `/${controller.name}/:${controller.idParameter || 'id'}`
      info(`    PUT ${endpoint} -> ${controller.put().description}`)
      app.put(endpoint, async (req, res, next) => {
        const request = Object.assign({}, req.body, req.params)
        const usecase = controller.put
        await defaultController(usecase, request, req.user, res, next)
      })
    }

    if (controller.delete) {
      const endpoint = `/${controller.name}/:${controller.idParameter || 'id'}`
      info(`    DELETE ${endpoint} -> ${controller.delete().description}`)
      app.delete(endpoint, async (req, res, next) => {
        const request = req.params
        const usecase = controller.delete
        await defaultController(usecase, request, req.user, res, next)
      })
    }
  })
}

module.exports = generateRoutes