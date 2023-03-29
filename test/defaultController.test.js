const assert = require('assert')
const { Ok, Err, usecase, step } = require('@herbsjs/herbs')
const defaultController = require('../src/defaultController')


describe('Default Controller', () => {

    function aResponse() {
        return {
            status(code) { this._status = code; return this },
            send(data) { this._data = data; return this },
            json(data) { this._data = data; return this },
            end() { return this },
        }
    }

    const anUseCase = ({ stepReturn }) =>
        () => usecase(`An Usecase`, {
            request: { id: Number },
            authorize: async _ => Ok(),
            'A Step': step(ctx => stepReturn(ctx))

        })

    describe('When usecase returns Ok', () => {

        it('Should return 200', async () => {
            // Given
            const res = aResponse()
            const usecase = anUseCase({ stepReturn: (ctx) => { ctx.ret = ctx.req.id } })

            // When
            await defaultController({ usecase, request: { id: 1 }, authorizationInfo: {}, res, next: () => { } })

            // Then
            assert.deepStrictEqual(res._status, 200)
            assert.deepStrictEqual(res._data, 1)
        })
    })

    describe('When usecase returns Err', () => {

        describe('When usecase returns Err.invalidArgument', () => {
            it('Should return 400', async () => {
                // Given
                const res = aResponse()
                const usecase = anUseCase({ stepReturn: () => Err.invalidArguments({ message: `Invalid Arg X`, payload: { entity: 'entity Y' } }, 'Arg X') })

                // When
                await defaultController({ usecase, request: { id: 1 }, authorizationInfo: {}, res, next: () => { } })

                // Then
                assert.deepStrictEqual(res._status, 400)
                assert.deepStrictEqual(res._data, { error: { payload: { entity: 'entity Y', invalidArgs: undefined }, code: 'INVALID_ARGUMENTS', message: 'Invalid Arg X', cause: undefined } })
            })
        })

        describe('When usecase returns Err.notFound', () => {
            it('Should return 404', async () => {
                // Given
                const res = aResponse()
                const usecase = anUseCase({ stepReturn: () => Err.notFound() })

                // When
                await defaultController({ usecase, request: { id: 1 }, authorizationInfo: {}, res, next: () => { } })

                // Then
                assert.deepStrictEqual(res._status, 404)
                assert.deepStrictEqual(res._data, { error: { payload: undefined, code: 'NOT_FOUND', message: 'Not Found', cause: undefined } })
            })
        })

        describe('When usecase returns Err.alreadyExists', () => {
            it('Should return 409', async () => {
                // Given
                const res = aResponse()
                const usecase = anUseCase({ stepReturn: () => Err.alreadyExists() })

                // When
                await defaultController({ usecase, request: { id: 1 }, authorizationInfo: {}, res, next: () => { } })

                // Then
                assert.deepStrictEqual(res._status, 409)
                assert.deepStrictEqual(res._data, { error: { payload: undefined, code: 'ALREADY_EXISTS', message: 'Already exists', cause: undefined } })
            })
        })

        describe('When usecase returns Err.invalidEntity', () => {
            it('Should return 422', async () => {
                // Given
                const res = aResponse()
                const usecase = anUseCase({ stepReturn: () => Err.invalidEntity() })

                // When
                await defaultController({ usecase, request: { id: 1 }, authorizationInfo: {}, res, next: () => { } })

                // Then
                assert.deepStrictEqual(res._status, 422)
                assert.deepStrictEqual(res._data, { error: { payload: undefined, code: 'INVALID_ENTITY', message: 'Invalid entity', cause: undefined } })
            })
        })

        describe('When usecase returns Err.permissionDenied', () => {
            it('Should return 403', async () => {
                // Given
                const res = aResponse()
                const usecase = anUseCase({ stepReturn: () => Err.permissionDenied() })

                // When
                await defaultController({ usecase, request: { id: 1 }, authorizationInfo: {}, res, next: () => { } })

                // Then
                assert.deepStrictEqual(res._status, 403)
                assert.deepStrictEqual(res._data, { error: { payload: undefined, code: 'PERMISSION_DENIED', message: 'Permission denied', cause: undefined } })
            })
        })

        describe('When usecase returns Err.unknown', () => {
            it('Should return 500', async () => {
                // Given
                const res = aResponse()
                const usecase = anUseCase({ stepReturn: () => Err.unknown() })

                // When
                await defaultController({ usecase, request: { id: 1 }, authorizationInfo: {}, res, next: () => { } })

                // Then
                assert.deepStrictEqual(res._status, 500)
                assert.deepStrictEqual(res._data, { error: { payload: undefined, code: 'UNKNOWN', message: 'Unknown Error', cause: undefined } })
            })
        })

        describe('When usecase returns Err.custom', () => {
            it('Should return 500', async () => {
                // Given
                const res = aResponse()
                const usecase = anUseCase({ stepReturn: () => Err.buildCustomErr('PRODUCT_ERR', 'message', { entity: 'product' }, undefined, 'Product') })

                // When
                await defaultController({ usecase, request: { id: 1 }, authorizationInfo: {}, res, next: () => { } })

                // Then
                assert.deepStrictEqual(res._status, 400)
                assert.deepStrictEqual(res._data, { error: { payload: { entity: 'product' }, code: 'PRODUCT_ERR', message: 'message', cause: undefined } })
            })
        })
    })

    describe('When usecase throws an error', () => {
        it('Should return 500', async () => {
            // Given
            const res = aResponse()
            const usecase = anUseCase({ stepReturn: () => { throw new Error('Something went wrong') } })

            // When
            await defaultController({ usecase, request: { id: 1 }, authorizationInfo: {}, res, next: () => { } })

            // Then
            assert.deepStrictEqual(res._status, 500)
            assert.deepStrictEqual(res._data, { error: 'Error', message: 'Something went wrong' })
        })
    })

    describe('When something throws an error', () => {
        it('Should return 500', async () => {
            // Given
            const res = aResponse()
            const usecase = () => { throw new Error('Something went wrong') }

            // When
            await defaultController({ usecase, request: { id: 1 }, authorizationInfo: {}, res, next: () => { } })

            // Then
            assert.deepStrictEqual(res._status, 500)
            assert.deepStrictEqual(res._data, { error: 'Error', message: 'Something went wrong' })
        })
    })

})

