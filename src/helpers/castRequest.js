const { BaseEntity } = require("gotu/src/baseEntity");

const castRequest = (value, type) => {
  if (value === undefined) return undefined;

  if (type === Array) return value;

  if (type === Number) return Number(value);

  if (type === String) return String(value);

  if (type.prototype instanceof BaseEntity)
    return Object.assign(new type(), value);
};

module.exports = castRequest;
