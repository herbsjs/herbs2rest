const castRequest = require('./castRequest')

const req2request = (req, useCase) => {
  const schema = useCase.requestSchema
  const params = {}
  const fields = Object.keys(schema)

  for (const field of fields) {
    const type = schema[field]
    const value = castRequest(req[field], type)

    if (value !== undefined) params[field] = value
  }

  return params
}

module.exports = req2request