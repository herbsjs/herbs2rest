const { herbarium } = require('@herbsjs/herbarium')
const { usecase, step, Ok } = require('@herbsjs/herbs')
const assert = require('assert').strict
const { generateEndpoints } = require('../src/generateEndpoints')

describe('generateEndpoint', () => {

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

    describe('when a use case has all the basic REST metadata', () => {

        describe('should generate the endpoint', () => {
            const testData = [
                {
                    method: 'GET',
                    path: '/readEntities/:id',
                    restParameters: { params: { id1: Number } },
                    request: { params: { id1: 1 } },
                    expectedResult: { id1: 1, usecaseDesc: 'GET Usecase', user: 'Bob' },
                },
                {
                    method: 'GET',
                    path: '/readEntities',
                    restParameters: { query: { id1: Number } },
                    request: { query: { id1: 1 } },
                    expectedResult: { id1: 1, usecaseDesc: 'GET Usecase', user: 'Bob' },
                },
                {
                    method: 'POST',
                    path: '/createEntities',
                    restParameters: { body: { name: String } },
                    request: { body: { name: 'Jane' } },
                    expectedResult: { name: 'Jane', usecaseDesc: 'POST Usecase', user: 'Bob' },
                },
                {
                    method: 'PUT',
                    path: '/updateEntities/:id',
                    restParameters: { params: { id: Number }, body: { name: String } },
                    request: { params: { id: 1 }, body: { name: 'Jane' } },
                    expectedResult: { id: 1, name: 'Jane', usecaseDesc: 'PUT Usecase', user: 'Bob' },
                },
                {
                    method: 'DELETE',
                    path: '/deleteEntities/:id',
                    restParameters: { params: { id: Number } },
                    request: { params: { id: 1 } },
                    expectedResult: { id: 1, usecaseDesc: 'DELETE Usecase', user: 'Bob' },
                },
                {
                    method: 'PATCH',
                    path: '/patchEntities/:id',
                    restParameters: { params: { id: Number }, body: { name: String } },
                    request: { params: { id: 1 }, body: { name: 'Jane' } },
                    expectedResult: { id: 1, name: 'Jane', usecaseDesc: 'PATCH Usecase', user: 'Bob' }
                },
                {
                    method: 'HEAD',
                    path: '/headEntities/:id',
                    restParameters: { params: { id: Number } },
                    request: { params: { id: 1 } },
                    expectedResult: { id: 1, usecaseDesc: 'HEAD Usecase', user: 'Bob' }
                },
                {
                    method: 'OPTIONS',
                    path: '/optionsEntities/:id',
                    restParameters: { params: { id: Number } },
                    request: { params: { id: 1 } },
                    expectedResult: { id: 1, usecaseDesc: 'OPTIONS Usecase', user: 'Bob' }
                },
                {
                    method: 'TRACE',
                    path: '/traceEntities/:id',
                    restParameters: { params: { id: Number } },
                    request: { params: { id: 1 } },
                    expectedResult: { id: 1, usecaseDesc: 'TRACE Usecase', user: 'Bob' }
                },
                {
                    method: 'CONNECT',
                    path: '/connectEntities/:id',
                    restParameters: { params: { id: Number } },
                    request: { params: { id: 1 } },
                    expectedResult: { id: 1, usecaseDesc: 'CONNECT Usecase', user: 'Bob' }
                },
            ]

            testData.forEach(test => {
                it(`for a ${test.method}`, async () => {
                    // given
                    herbarium.reset()
                    anUseCase({ method: test.method })
                    const REST = [
                        {
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
                            },
                        },
                    ]
                    herbarium.nodes.get(`${test.method}Usecase`).metadata({ REST })
                    const server = aServer()

                    // when
                    generateEndpoints({ herbarium, server })

                    // then
                    const { path, method: verb, controller } = server.endpoints[0]
                    assert.equal(path, test.path)
                    assert.equal(verb, test.method)
                    assert.deepEqual(await controller(test.request), test.expectedResult)
                })
            })
        })


    })

    describe('when a use case has a missing basic REST metadata', () => {
        describe('should not generate the endpoint', () => {
            it('when the use case is not a REST use case', () => {
                // given
                herbarium.reset()
                anUseCase({ method: 'GET' })
                const server = aServer()

                // when
                generateEndpoints({ herbarium, server })

                // then 
                assert.equal(server.endpoints.length, 0)
            })

            it('when the use case has forced not to generate the endpoint', () => {
                // given
                herbarium.reset()
                const method = 'GET'
                anUseCase({ method })
                const REST = false
                herbarium.nodes.get(`${method}Usecase`).metadata({ REST })
                const server = aServer()

                // when
                generateEndpoints({ herbarium, server })

                // then 
                assert.equal(server.endpoints.length, 0)
            })

            it('when the use case has an empty REST metadata', () => {
                // given
                herbarium.reset()
                const method = 'GET'
                anUseCase({ method })
                const REST = [{}]
                herbarium.nodes.get(`${method}Usecase`).metadata({ REST })
                const server = aServer()

                // when
                generateEndpoints({ herbarium, server })

                // then 
                assert.equal(server.endpoints.length, 0)
            })

            it('when the use case has no method', () => {
                // given
                herbarium.reset()
                const method = 'DELETE'
                anUseCase({ method })
                const REST = [{
                    path: '/deleteEntities/:id',
                    parameters: { params: { id: Number } },
                    parametersHandler: (req, parameters) => ({ req, parameters }),
                    authorizationHandler: (_) => 'Bob',
                    controller: ({ }) => { }
                }]
                herbarium.nodes.get(`${method}Usecase`).metadata({ REST })
                const server = aServer()

                // when
                // then 
                assert.throws(() => generateEndpoints({ herbarium, server }), /Error: 'method' metadata is required. It is not possible to generate a REST endpoint for usecase DELETEUsecase./)
            })
            it('when the use case has no path', () => {
                // given
                herbarium.reset()
                const method = 'DELETE'
                anUseCase({ method })
                const REST = [{
                    method,
                    parameters: { params: { id: Number } },
                    parametersHandler: (req, parameters) => ({ req, parameters }),
                    authorizationHandler: (_) => 'Bob',
                    controller: ({ }) => { }
                }]
                herbarium.nodes.get(`${method}Usecase`).metadata({ REST })
                const server = aServer()

                // when
                // then 
                assert.throws(() => generateEndpoints({ herbarium, server }), /Error: 'path' metadata is required. It is not possible to generate a REST endpoint for usecase DELETEUsecase./)
            })
            it('when the use case has no parameters', () => {
                // given
                herbarium.reset()
                const method = 'DELETE'
                anUseCase({ method })
                const REST = [{
                    method,
                    path: '/deleteEntities/:id',
                    parametersHandler: (req, parameters) => ({ req, parameters }),
                    authorizationHandler: (_) => 'Bob',
                    controller: ({ }) => { }
                }]
                herbarium.nodes.get(`${method}Usecase`).metadata({ REST })
                const server = aServer()

                // when
                // then 
                assert.throws(() => generateEndpoints({ herbarium, server }), /Error: 'parameters' metadata is required. It is not possible to generate a REST endpoint for usecase DELETEUsecase./)

            })
            it('when the use case has no authorizationHandler', () => {
                // given
                herbarium.reset()
                const method = 'DELETE'
                anUseCase({ method })
                const REST = [{
                    method,
                    path: '/deleteEntities/:id',
                    parameters: { params: { id: Number } },
                    parametersHandler: (req, parameters) => ({ req, parameters }),
                    controller: () => { }
                }]
                herbarium.nodes.get(`${method}Usecase`).metadata({ REST })
                const server = aServer()

                // when
                // then 
                assert.throws(() => generateEndpoints({ herbarium, server }), /Error: 'authorizationHandler' metadata is required. It is not possible to generate a REST endpoint for usecase DELETEUsecase./)
            })
            it('when the use case has no controller', () => {
                // given
                herbarium.reset()
                const method = 'DELETE'
                anUseCase({ method })
                const REST = [{
                    method,
                    path: '/deleteEntities/:id',
                    parameters: { params: { id: Number } },
                    parametersHandler: (req, parameters) => ({ req, parameters }),
                    authorizationHandler: (_) => 'Bob',
                }]
                herbarium.nodes.get(`${method}Usecase`).metadata({ REST })
                const server = aServer()

                // when
                // then 
                assert.throws(() => generateEndpoints({ herbarium, server }), /Error: 'controller' metadata is required. It is not possible to generate a REST endpoint for usecase DELETEUsecase./)
            })
        })
    })

    describe('when a use case has many REST metadata', () => {
        it('should generate the endpoints', async () => {
            // given
            herbarium.reset()
            const method = 'GET'
            anUseCase({ method })
            const REST = [{
                method,
                path: '/readEntities/:id',
                parameters: { params: { id1: Number } },
                parametersHandler: (usecase, req, parameters) => ({ usecase, req, parameters }),
                authorizationHandler: (_) => 'Bob',
                controller: ({ usecase, request, authorizationInfo }) => ({ id1: request.req.params.id1, usecaseDesc: usecase().description, user: authorizationInfo })
            },
            {
                method: 'POST',
                path: '/readEntitiesTest',
                parameters: { body: { name: Number } },
                parametersHandler: (usecase, req, parameters) => ({ usecase, req, parameters }),
                authorizationHandler: (_) => 'Jhon',
                controller: ({ usecase, request, authorizationInfo }) => ({ id1: request.req.params.id1, usecaseDesc: usecase().description, user: authorizationInfo })
            }]
            herbarium.nodes.get(`${method}Usecase`).metadata({ REST })
            const server = aServer()

            // when
            generateEndpoints({ herbarium, server })

            // then
            const { path: path1, method: verb1, controller: controller1 } = server.endpoints[0]
            const { path: path2, method: verb2, controller: controller2 } = server.endpoints[1]

            assert.equal(path1, '/readEntities/:id')
            assert.equal(verb1, 'GET')
            assert.deepEqual(await controller1({ params: { id1: 1 } }), { id1: 1, usecaseDesc: `${method} Usecase`, user: 'Bob' })
            assert.equal(path2, '/readEntitiesTest')
            assert.equal(verb2, 'POST')
            assert.deepEqual(await controller2({ params: { id1: 1 } }), { id1: 1, usecaseDesc: `${method} Usecase`, user: 'Jhon' })

        })

    })


    describe('when a more than one use case has the same endpoint (method and path)', () => {
        it('should throw an error', () => {
            // given
            herbarium.reset()
            anUseCase({ method: 'GET' })
            anUseCase({ method: 'POST' })
            const server = aServer()
            herbarium.nodes.get(`GETUsecase`).metadata({
                REST: [{
                    method: 'GET',
                    path: '/samePath',
                    parameters: { body: { name: String } },
                    parametersHandler: (req, parameters) => ({ req, parameters }),
                    authorizationHandler: (_) => 'Bob',
                    controller: () => { }
                }]
            })
            herbarium.nodes.get(`POSTUsecase`).metadata({
                REST: [{
                    method: 'GET',
                    path: '/samePath',
                    parameters: { body: { name: String } },
                    parametersHandler: (req, parameters) => ({ req, parameters }),
                    authorizationHandler: (_) => 'Bob',
                    controller: () => { }
                }]
            })

            // when
            // then 
            assert.throws(() => generateEndpoints({ herbarium, server }), /Error: It is not possible to generate a REST endpoint for usecase \'POSTUsecase\'. There is already an endpoint for method GET and path \/samePath generated by usecase \'GETUsecase\'/)
        })
    })
})
