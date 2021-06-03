const assert = require('assert')

const castRequestParams = require('../src/helpers/castRequestParams')

describe('Helper - castRequestParams', () => {
  it('Should return value when type not in array', () => {
    const result = castRequestParams('123', Number)

    assert.deepStrictEqual(typeof result, 'string')
    assert.deepStrictEqual(result, '123')
  })

  it('Should return value in array when type is Array', () => {
    const result = castRequestParams('123', Array)

    assert.deepStrictEqual(typeof result, 'object')
    assert.deepStrictEqual(result, [ '123' ])
  })

  it('Should return value in array when type is string array', () => {
    const result = castRequestParams('123', [ '123' ])

    assert.deepStrictEqual(typeof result, 'object')
    assert.deepStrictEqual(result, [ '123' ])
  })
})
