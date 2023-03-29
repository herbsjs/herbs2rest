const assert = require('assert')

const castRequest = require('../../src/legacy/helpers/castRequest')

const { entity, field } = require('@herbsjs/gotu')

describe('Helper - castRequest', () => {
  it('Should return undefined when value is undefined even if type is defined', () => {
    const result = castRequest(undefined, Number)

    assert.deepStrictEqual(result, undefined)
  })

  it('Should return number when type is Number', () => {
    const result = castRequest('234', Number)

    assert.deepStrictEqual(typeof result, 'number')
    assert.deepStrictEqual(result, 234)
  })

  it('Should return an array when type is Array', () => {
    const result = castRequest(['', ''], Array)

    assert.deepStrictEqual(Array.isArray(result), true)
  })

  it('Should return an array when type is Number Array', () => {
    const result = castRequest([1, 2], [Number])

    assert.deepStrictEqual(Array.isArray(result), true)
  })

  it('Should return a string when type is String', () => {
    const result = castRequest(1, String)

    assert.deepStrictEqual(typeof result, 'string')
    assert.deepStrictEqual(result, '1')
  })

  it('Should return a instance of the passed Entity', () => {
    const Entity = entity('entity', {
      name: field(String),
    })

    const result = castRequest({ name: 'test' }, Entity)

    assert.deepStrictEqual(result instanceof Entity, true)
  })
})
