const castRequest = require('./castRequest')
const castRequestParams = require('./castRequestParams')

const req2request = (req, usecase) => {
  const schema = usecase.requestSchema
  const params = {}
  const fields = Object.keys(schema)

  const reqFields = { ...req.body, ...req.query }
  const reqParams = { ...req.params }

  for (const field of fields) {
    const type = schema[field]

    let fields = reqFields[field]

    if (reqParams[field]) fields = castRequestParams(reqParams[field], type)

    const value = castRequest(fields, type)

    if (value !== undefined) params[field] = value
  }

  return params
}

module.exports = req2request
