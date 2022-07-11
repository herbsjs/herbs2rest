const { BaseEntity } = require('@herbsjs/gotu/src/baseEntity')

const castRequest = (value, type) => {
  if (value === undefined)
    return undefined

  if (Array.isArray(type))
    return value.map(item => castRequest(item, type[0]))

  if (type === Array)
    return value

  if (type === Number)
    return Number(value)

  if (type === String)
    return String(value)

  if (type === Boolean)
    return Boolean(value)

  if (type === Date) 
    return new Date(value)

  if (type.prototype instanceof BaseEntity)
    return Object.assign(new type(), value)
}

module.exports = castRequest
