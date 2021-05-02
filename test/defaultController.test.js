const assert = require('assert')

const defaultController = require('../src/defaultController')

describe('Herbs2Rest - Default Controller', () => {
  class Response {
    status = statusCode => {
      this.statusCode = statusCode

      return {
        json: data => {
          this.data = data
        }
      }
    }
  }

  it('Do not should authorize usecase', async () => {
    // Given
    const res = new Response()

    const usecase = () => ({
      authorize: () => false
    })

    // When
    await defaultController(usecase, null, null, res, () => {})

    // Then
    assert.deepStrictEqual(res.statusCode, 403)
  })
})