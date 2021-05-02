const { BaseEntity } = require('gotu/src/baseEntity')

const castRequest = (value, type) => {
  if (value === undefined) return undefined

  if (Array.isArray(type)) return [castRequest(value, type[0])]

  if (type === Number) return Number(value)

  if (type === String) return String(value)

  if (type.prototype instanceof BaseEntity) return Object.assign(new type(), value)
}

module.exports = castRequest