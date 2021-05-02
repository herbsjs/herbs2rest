const defaultController = require('./defaultController')

const generateRoutes = (controllersList, app) => {
  controllersList.forEach(controller => {
    if (controller.getAll) {
      app.get(`/${controller.name}`, async (req, res, next) => {
        const request = req.query
        const usecase = controller.getAll
        await defaultController(usecase, request, req.user, res, next)
      })
    }

    if (controller.getById) {
      app.get(`/${controller.name}/:${controller.idParameter || 'id'}`, async (req, res, next) => {
        const request = Object.assign({}, req.query, req.params)
        const usecase = controller.getById
        await defaultController(usecase, request, req.user, res, next)
      })
    }

    if (controller.post) {
      app.post(`/${controller.name}`, async (req, res, next) => {
        const request = req.body
        const usecase = controller.post
        await defaultController(usecase, request, req.user, res, next)
      })
    }

    if (controller.put) {
      app.put(`/${controller.name}/:${controller.idParameter || 'id'}`, async (req, res, next) => {
        const request = Object.assign({}, req.body, req.params)
        const usecase = controller.put
        await defaultController(usecase, request, req.user, res, next)
      })
    }

    if (controller.delete) {
      app.delete(`/${controller.name}/:${controller.idParameter || 'id'}`, async (req, res, next) => {
        const request = req.params
        const usecase = controller.delete
        await defaultController(usecase, request, req.user, res, next)
      })
    }
  })
}

module.exports = generateRoutes 