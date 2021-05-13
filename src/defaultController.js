/* eslint-disable no-unused-vars */
const req2request = require('./helpers/req2request')

const defaultController = async (usecase, req, user, res, next, methodName) => {
  try {
    const ucInstance = usecase()

    const hasAccess = ucInstance.authorize(user)

    if (hasAccess === false) {
      return res.status(403).json({ message: 'User is not authorized' })
    }

    const request = req2request(req, ucInstance)
    const response = await ucInstance.run(request)
      
    if (response.isOk) 
      res.status(200).json(response.ok)
    else 
      res.status(400).json({ error: response.err })

    res.end()
  } catch (error) {
    res.status(500).json({ error: error.name, message: error.message })

    next()
  }
}

module.exports =  defaultController