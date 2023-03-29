const assert = require('assert')
const { Ok, Err, usecase, step } = require('@herbsjs/herbs')
const defaultController = require('../../src/legacy/defaultController')

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

    end = () => { }
  }

  it('Should return 200 when everything runs ok', async () => {
    const res = new Response()
    const usecase = () => ({
      authorize: async () => true,
      run: () => Ok(),
      requestSchema: {
        name: String,
        number: Number,
      },
    })

    const req = {}

    await defaultController(usecase, req, null, res, () => { })

    assert.deepStrictEqual(res.statusCode, 200)
  })

  it('Should not authorize usecase', async () => {
    // Given
    const res = new Response()

    const usecase = () => ({
      authorize: async () => false,
    })

    // When
    await defaultController(usecase, null, null, res, () => { })

    // Then
    assert.deepStrictEqual(res.statusCode, 403)
  })

  it('Should return 400 when usecase returns a Err.invalidArgument', async () => {
    const res = new Response()

    const uc = () =>
      usecase('Use Case X', {
        request: { name: String, number: Number, },
        authorize: async () => Ok(),
        'Step 1': step((ctx) =>
          ctx.ret = Err.invalidArguments({ message: `Invalid Arg X`, payload: { entity: 'entity Y' } }, 'Arg X')
        )
      })

    const req = {}

    await defaultController(uc, req, null, res, () => { })

    assert.deepStrictEqual(res.statusCode, 400)
    assert.deepStrictEqual(res.data.error.code, 'INVALID_ARGUMENTS')
  })

  it('Should return 403 when usecase returns a Err.permissionDenied', async () => {
    const res = new Response()

    const uc = () =>
      usecase('Use Case X', {
        request: { name: String, number: Number, },
        authorize: async () => Ok(),
        'Step 1': step((ctx) =>
          ctx.ret = Err.permissionDenied({ message: `Permission Denied X`, payload: { entity: 'entity Y' } })
        )
      })

    const req = {}

    await defaultController(uc, req, null, res, () => { })

    assert.deepStrictEqual(res.statusCode, 403)
    assert.deepStrictEqual(res.data.error.code, 'PERMISSION_DENIED')
  })

  it('Should return 404 when usecase returns a Err.permissionDenied', async () => {
    const res = new Response()

    const uc = () =>
      usecase('Use Case X', {
        request: { name: String, number: Number, },
        authorize: async () => Ok(),
        'Step 1': step((ctx) =>
          ctx.ret = Err.notFound({ message: `Not Found X`, payload: { entity: 'entity Y' } })
        )
      })

    const req = {}

    await defaultController(uc, req, null, res, () => { })

    assert.deepStrictEqual(res.statusCode, 404)
    assert.deepStrictEqual(res.data.error.code, 'NOT_FOUND')
  })

  it('Should return 409 when usecase returns a Err.alreadyExists', async () => {
    const res = new Response()

    const uc = () =>
      usecase('Use Case X', {
        request: { name: String, number: Number, },
        authorize: async () => Ok(),
        'Step 1': step((ctx) =>
          ctx.ret = Err.alreadyExists({ message: `Already Exists X`, payload: { entity: 'entity Y' } })
        )
      })

    const req = {}

    await defaultController(uc, req, null, res, () => { })

    assert.deepStrictEqual(res.statusCode, 409)
    assert.deepStrictEqual(res.data.error.code, 'ALREADY_EXISTS')
  })

  it('Should return 422 when usecase returns a Err.invalidEntity', async () => {
    const res = new Response()

    const uc = () =>
      usecase('Use Case X', {
        request: { name: String, number: Number, },
        authorize: async () => Ok(),
        'Step 1': step((ctx) =>
          ctx.ret = Err.invalidEntity({ message: `Invalid Entity X`, payload: { entity: 'entity Y' } })
        )
      })

    const req = {}

    await defaultController(uc, req, null, res, () => { })

    assert.deepStrictEqual(res.statusCode, 422)
    assert.deepStrictEqual(res.data.error.code, 'INVALID_ENTITY')
  })

  it('Should return 500 when usecase returns a Err.unknown', async () => {
    const res = new Response()

    const uc = () =>
      usecase('Use Case X', {
        request: { name: String, number: Number, },
        authorize: async () => Ok(),
        'Step 1': step((ctx) =>
          ctx.ret = Err.unknown({ message: `Unknown X`, payload: { entity: 'entity Y' } })
        )
      })

    const req = {}

    await defaultController(uc, req, null, res, () => { })

    assert.deepStrictEqual(res.statusCode, 500)
    assert.deepStrictEqual(res.data.error.code, 'UNKNOWN')
  })

  it('Should return 500 when usecase throws error', async () => {
    const res = new Response()

    const uc = () =>
      usecase('Use Case X', {
        request: { name: String, number: Number, },
        authorize: async () => Ok(),
        'Step 1': step(() => { throw new Error() }
        )
      })

    const req = {}

    await defaultController(uc, req, null, res, () => { })

    assert.deepStrictEqual(res.statusCode, 500)
  })

  it('Should return 500 when something throws error', async () => {
    const res = new Response()

    const usecase = () => {
      throw new Error('Test')
    }

    await defaultController(usecase, null, null, res, () => { })

    assert.deepStrictEqual(res.statusCode, 500)
  })


})
