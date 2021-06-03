const castRequestParams = (value, type) => {
  if (type === Array || Array.isArray(type))
    return [value]

  return value
}

module.exports = castRequestParams
