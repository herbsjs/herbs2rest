const defaultController = require('./defaultController')

const generateRoutes = (controllerList, app) => {
  controllerList.forEach(controller => {
    if (controller.getAll) {
      app.get(`/${controller.name}`, async (req, res, next) => {
        const request = { query: req.query }
        const usecase = controller.getAll.useCase
        const currentController = controller.getAll.customController || defaultController

        await currentController(usecase, request, req.user, res, next)
      })
    }

    if (controller.getById) {
      app.get(`/${controller.name}/:${controller.getById.idParameter || 'id'}`, async (req, res, next) => {
        const request = { query: req.query, params: req.params }
        const usecase = controller.getById.useCase
        const currentController = controller.getById.customController || defaultController

        await currentController(usecase, request, req.user, res, next)
      })
    }

    if (controller.post) {
      app.post(`/${controller.name}`, async (req, res, next) => {
        const request = { body: req.body }
        const usecase = controller.post.useCase
        const currentController = controller.post.customController || defaultController

        await currentController(usecase, request, req.user, res, next)
      })
    }

    if (controller.put) {
      app.put(`/${controller.name}/:${controller.put.idParameter || 'id'}`, async (req, res, next) => {
        const request = { body: req.body, params: req.params }
        const usecase = controller.put.useCase
        const currentController = controller.put.customController || defaultController

        await currentController(usecase, request, req.user, res, next)
      })
    }

    if (controller.delete) {
      app.delete(`/${controller.name}/:${controller.delete.idParameter || 'id'}`, async (req, res, next) => {
        const request = { params: req.params }
        const usecase = controller.delete.useCase
        const currentController = controller.delete.customController || defaultController

        await currentController(usecase, request, req.user, res, next)
      })
    }
  })
}

module.exports = generateRoutes
