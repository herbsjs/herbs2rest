const assert = require('assert')

const defaultController = require('../src/defaultController')

describe('Herbs2Rest - Default Controller', () => {
  class Response {
    status = (statusCode) => {
      this.statusCode = statusCode

      return {
        json: (data) => {
          this.data = data
        },
      }
    }

    end = () => {}
  }

  it('Should not authorize usecase', async () => {
    // Given
    const res = new Response()

    const usecase = () => ({
      authorize: async () => false,
    })

    // When
    await defaultController(usecase, null, null, res, () => {})

    // Then
    assert.deepStrictEqual(res.statusCode, 403)
  })

  it('Should return 400 when usecase throws error', async () => {
    const res = new Response()

    const usecase = () => ({
      authorize: async () => true,
      run: () => new Error(),
      requestSchema: {
        name: String,
        number: Number,
      },
    })

    const req = {}

    await defaultController(usecase, req, null, res, () => {})

    assert.deepStrictEqual(res.statusCode, 400)
  })

  it('Should return 500 when something throws error', async () => {
    const res = new Response()

    const usecase = () => {
      throw new Error('Test')
    }

    await defaultController(usecase, null, null, res, () => {})

    assert.deepStrictEqual(res.statusCode, 500)
  })

  it('Should return 200 when everything runs ok', async () => {
    const res = new Response()
    const usecase = () => ({
      authorize: async () => true,
      run: () => ({ isOk: true, ok: 'ok' }),
      requestSchema: {
        name: String,
        number: Number,
      },
    })

    const req = {}

    await defaultController(usecase, req, null, res, () => {})

    assert.deepStrictEqual(res.statusCode, 200)
  })
})
