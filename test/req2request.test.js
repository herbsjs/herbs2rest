const assert = require('assert')

const req2request = require('../src/helpers/req2request')

describe('Helper - req2request', () => {
  const usecase = () => ({
    authorize: async () => false,

    requestSchema: {
      name: String,
      number: Number,
      boolean: Boolean,
      date: Date,
      ids: [Number]
    },

    run: () => true,
  })

  it('Should return the request accordingly to the usecase request schema - only body', () => {
    const req = {
      body: {
        name: 'test',
        number: '1',
        boolean: 'true',
        date: '2019-07-28',
        ids: ['1', '2'],
        otherUnused: ''
      },
      params: {
      }
    }

    const expected = {
      name: 'test',
      number: 1,
      boolean: true,
      date: new Date('2019-07-28'),
      ids: [1, 2]
    }

    const result = req2request(req, usecase())

    assert.deepStrictEqual(expected, result)
  }),

    it('Should return the request accordingly to the usecase request schema - body and query string', () => {
      const req = {
        body: {
          name: 'test',
          otherUnused: ''
        },
        params: {
          number: '1'
        }
      }

      const expected = {
        name: 'test',
        number: 1
      }

      const result = req2request(req, usecase())

      assert.deepStrictEqual(expected, result)
    }),

    it('Should return the request accordingly to the usecase request schema with parameters', () => {
      const req = {
        body: {
          name: 'test',
          number: '1',
          otherUnused: ''
        },
        params: {
          ids: '1'
        }
      }

      const expected = {
        name: 'test',
        number: 1,
        ids: [1]
      }

      const result = req2request(req, usecase())

      assert.deepStrictEqual(expected, result)
    })
})
