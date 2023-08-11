const { herbarium } = require('@herbsjs/herbarium')
const { usecase, step, Ok } = require('@herbsjs/herbs')
const assert = require('assert').strict
const { routes } = require('../src/routes')
const { endpoints } = require('../src/endpoints')

describe('routes', () => {

    const anUseCase = ({ method }) => {

        const anUC = () => usecase(`${method} Usecase`, {
            request: { id: Number },
            authorize: async _ => Ok(),
            'A Step': step(_ => Ok())
        })

        herbarium.nodes.add(`${method}Usecase`, anUC, herbarium.node.usecase)

        return { anUC, herbarium }
    }

    function aServer() {
        const server = {
            _endpoints: [],
            get endpoints() { return this._endpoints },
            get(path, controller) { this._endpoints.push({ path, controller, method: 'GET' }) },
            post(path, controller) { this._endpoints.push({ path, controller, method: 'POST' }) },
            put(path, controller) { this._endpoints.push({ path, controller, method: 'PUT' }) },
            delete(path, controller) { this._endpoints.push({ path, controller, method: 'DELETE' }) },
            patch(path, controller) { this._endpoints.push({ path, controller, method: 'PATCH' }) },
            head(path, controller) { this._endpoints.push({ path, controller, method: 'HEAD' }) },
            options(path, controller) { this._endpoints.push({ path, controller, method: 'OPTIONS' }) },
            trace(path, controller) { this._endpoints.push({ path, controller, method: 'TRACE' }) },
            connect(path, controller) { this._endpoints.push({ path, controller, method: 'CONNECT' }) },
        }
        return server
    }

    describe('end points', () => {
        const testData = [
            {
                method: 'GET',
                path: '/readEntities/:id',
                restParameters: { params: { id1: Number } },
                request: { params: { id1: 1 } },
                result: { id1: 1, usecaseDesc: 'GET Usecase', user: 'Bob' },
            },
            {
                method: 'GET',
                path: '/readEntities',
                restParameters: { query: { id1: Number } },
                request: { query: { id1: 1 } },
                result: { id1: 1, usecaseDesc: 'GET Usecase', user: 'Bob' },
            },
            {
                method: 'POST',
                path: '/createEntities',
                restParameters: { body: { name: String } },
                request: { body: { name: 'Jane' } },
                result: { name: 'Jane', usecaseDesc: 'POST Usecase', user: 'Bob' },
            },
            {
                method: 'PUT',
                path: '/updateEntities/:id',
                restParameters: { params: { id: Number }, body: { name: String } },
                request: { params: { id: 1 }, body: { name: 'Jane' } },
                result: { id: 1, name: 'Jane', usecaseDesc: 'PUT Usecase', user: 'Bob' },
            },
            {
                method: 'DELETE',
                path: '/deleteEntities/:id',
                restParameters: { params: { id: Number } },
                request: { params: { id: 1 } },
                result: { id: 1, usecaseDesc: 'DELETE Usecase', user: 'Bob' },
            },
            {
                method: 'PATCH',
                path: '/patchEntities/:id',
                restParameters: { params: { id: Number }, body: { name: String } },
                request: { params: { id: 1 }, body: { name: 'Jane' } },
                result: { id: 1, name: 'Jane', usecaseDesc: 'PATCH Usecase', user: 'Bob' }
            },
            {
                method: 'HEAD',
                path: '/headEntities/:id',
                restParameters: { params: { id: Number } },
                request: { params: { id: 1 } },
                result: { id: 1, usecaseDesc: 'HEAD Usecase', user: 'Bob' }
            },
            {
                method: 'OPTIONS',
                path: '/optionsEntities/:id',
                restParameters: { params: { id: Number } },
                request: { params: { id: 1 } },
                result: { id: 1, usecaseDesc: 'OPTIONS Usecase', user: 'Bob' }
            },
            {
                method: 'TRACE',
                path: '/traceEntities/:id',
                restParameters: { params: { id: Number } },
                request: { params: { id: 1 } },
                result: { id: 1, usecaseDesc: 'TRACE Usecase', user: 'Bob' }
            },
            {
                method: 'CONNECT',
                path: '/connectEntities/:id',
                restParameters: { params: { id: Number } },
                request: { params: { id: 1 } },
                result: { id: 1, usecaseDesc: 'CONNECT Usecase', user: 'Bob' }
            },
        ]
        testData.forEach(test => {
            it(`should create endpoint ${test.method} ${test.path}`, async () => {
                // given
                herbarium.reset()
                anUseCase({ method: test.method })
                const server = aServer()
                endpoints({ herbarium }, {
                    'v1': (endpoints) => {
                        endpoints.for(`${test.method}Usecase`).use({
                            method: test.method,
                            path: test.path,
                            parameters: test.restParameters,
                            parametersHandler: (usecase, req, parameters) => ({ usecase, req, parameters }),
                            authorizationHandler: (_) => 'Bob',
                            controller: ({ usecase, request, authorizationInfo }) => {
                                let result = { usecaseDesc: usecase().description, user: authorizationInfo }
                                if (test.restParameters.params) result = { ...result, ...request.req.params }
                                if (test.restParameters.query) result = { ...result, ...request.req.query }
                                if (test.restParameters.body) result = { ...result, ...request.req.body }
                                return result
                            }
                        })
                    }
                })

                // when
                routes({ server, herbarium }).attach()

                // then
                const { path, method: verb, controller } = server.endpoints[0]
                assert.equal(path, test.path)
                assert.equal(verb, test.method)
                assert.deepEqual(await controller(test.request), test.result)
            })
        })
    })

    describe('end point with multiple usecases', () => {
        it('should not create endpoint', async () => {
            // given
            herbarium.reset()
            anUseCase({ method: herbarium.crud.create })
            anUseCase({ method: herbarium.crud.update })
            const server = aServer()
            endpoints({ herbarium }, {
                'v1': (endpoints) => {
                    endpoints.for(`CreateUsecase`).use({
                        method: 'GET',
                        path: '/samePath',
                    })
                    endpoints.for(`UpdateUsecase`).use({
                        method: 'GET',
                        path: '/samePath',
                    })
                    endpoints.build()
                }
            })

            // when
            function attach() {
                routes({ server, herbarium }).attach()
            }
            
            // then
            assert.throws(attach, { message: 'It is not possible to generate a REST endpoint for usecase \'UpdateUsecase\'. There is already an endpoint for method GET and path /samePath generated by usecase \'CreateUsecase\'.' })
        })
    })
})