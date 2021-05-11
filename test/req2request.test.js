const assert = require('assert')

const req2request = require('../src/helpers/req2request')

describe('Helper - req2request', () => {
  const usecase = () => ({
    authorize: () => false,

    requestSchema: {
      name: String,
      number: Number,
    },

    run: () => true,
  })

  it('Should return the request accordingly to the usecase request schema', () => {
    const req = {
      name: 'test',
      number: '1',
      otherUnused: '',
    }

    const expected = {
      name: 'test',
      number: 1,
    }

    const result = req2request(req, usecase())

    assert.deepStrictEqual(expected, result)
  })
})
