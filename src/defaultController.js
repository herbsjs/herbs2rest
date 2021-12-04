/* eslint-disable no-unused-vars */
const req2request = require('./helpers/req2request')

const defaultController = async (usecase, req, user, res, next, methodName) => {
  try {
    const ucInstance = usecase()

    const hasAccess = await ucInstance.authorize(user)

    if (hasAccess === false) {
      return res.status(403).json({ message: 'User is not authorized' })
    }

    const request = req2request(req, ucInstance)
    const response = await ucInstance.run(request)

    if (response.isOk) {
      // OK
      res.status(200).json(response.ok)
    }
    else {
      // Err
      let status = 400
      if (response.isInvalidArgumentsError) status = 400
      if (response.isPermissionDeniedError) status = 403
      if (response.isNotFoundError) status = 404
      if (response.isAlreadyExistsError) status = 409
      if (response.isInvalidEntityError) status = 422
      if (response.isUnknownError) status = 500
      res.status(status).json({ error: response.err })
    }

    res.end()

  } catch (error) {
    res.status(500).json({ error: error.name, message: error.message })

    next()
  }
}

module.exports = defaultController