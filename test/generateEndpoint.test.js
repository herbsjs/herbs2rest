const { herbarium } = require('@herbsjs/herbarium')
const { usecase, step, Ok } = require('@herbsjs/herbs')
const assert = require('assert').strict
const { generateEndpoints } = require('../src/generateEndpoints')
const { type } = require('os')

describe('generateEndpoint', () => {

    const anUseCase = ({ method }) => {

        const anUC = () => usecase(`${method} Usecase`, {
            request: { id: Number },
            authorize: async _ => Ok(),
            'A Step': step(_ => Ok())
        })

        herbarium.usecases.add(anUC, `${method}Usecase`)

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
        }
        return server
    }

    describe('when a use case has all the basic REST metadata', () => {
        describe('should generate the endpoint', () => {
            it('for a GET', async () => {
                // given
                herbarium.reset()
                const method = 'GET'
                anUseCase({ method })
                const REST = [{
                    method,
                    path: '/readEntities/:id',
                    parameters: { params: { id1: Number } },
                    parametersHandler: (req, parameters) => ({ req, parameters }),
                    authorizationHandler: (_) => 'Bob',
                    controller: ({ usecase, request, authorizationInfo }) => ({ id1: request.req.params.id1, usecaseDesc: usecase().description, user: authorizationInfo })
                }]
                herbarium.usecases.get(`${method}Usecase`).metadata({ REST })
                const server = aServer()

                // when
                generateEndpoints({ herbarium, server })

                // then
                const { path, method: verb, controller } = server.endpoints[0]
                assert.equal(path, '/readEntities/:id')
                assert.equal(verb, 'GET')
                assert.deepEqual(await controller({ params: { id1: 1 } }), { id1: 1, usecaseDesc: `${method} Usecase`, user: 'Bob' })
            })

            it('for a GET (all)', async () => {
                // given
                herbarium.reset()
                const method = 'GET'
                anUseCase({ method })
                const REST = [{
                    method,
                    path: '/readEntities',
                    parameters: { query: { id1: Number } },
                    parametersHandler: (req, parameters) => ({ req, parameters }),
                    authorizationHandler: (_) => 'Bob',
                    controller: ({ usecase, request, authorizationInfo }) => ({ id1: request.req.query.id1, usecaseDesc: usecase().description, user: authorizationInfo })
                }]
                herbarium.usecases.get(`${method}Usecase`).metadata({ REST })
                const server = aServer()

                // when
                generateEndpoints({ herbarium, server })

                // then
                const { path, method: verb, controller } = server.endpoints[0]
                assert.equal(path, '/readEntities')
                assert.equal(verb, 'GET')
                assert.deepEqual(await controller({ query: { id1: 1 } }), { id1: 1, usecaseDesc: `${method} Usecase`, user: 'Bob' })
            })

            it('for a POST', async () => {
                // given
                herbarium.reset()
                const method = 'POST'
                anUseCase({ method })
                const REST = [{
                    method,
                    path: '/createEntities',
                    parameters: { body: { name: String } },
                    parametersHandler: (req, parameters) => ({ req, parameters }),
                    authorizationHandler: (_) => 'Bob',
                    controller: ({ usecase, request, authorizationInfo }) => ({ name: request.req.body.name, usecaseDesc: usecase().description, user: authorizationInfo })
                }]
                herbarium.usecases.get(`${method}Usecase`).metadata({ REST })
                const server = aServer()

                // when
                generateEndpoints({ herbarium, server })

                // then
                const { path, method: verb, controller } = server.endpoints[0]
                assert.equal(path, '/createEntities')
                assert.equal(method, 'POST')
                assert.deepEqual(await controller({ body: { name: 'Jane' } }), { name: 'Jane', usecaseDesc: `${method} Usecase`, user: 'Bob' })
            })

            it('for a PUT', async () => {
                // given
                herbarium.reset()
                const method = 'PUT'
                anUseCase({ method })
                const REST = [{
                    method,
                    path: '/updateEntities/:id',
                    parameters: { params: { id: Number }, body: { name: String } },
                    parametersHandler: (req, parameters) => ({ req, parameters }),
                    authorizationHandler: (_) => 'Bob',
                    controller: ({ usecase, request, authorizationInfo }) => ({ id: request.req.params.id, name: request.req.body.name, usecaseDesc: usecase().description, user: authorizationInfo })
                }]
                herbarium.usecases.get(`${method}Usecase`).metadata({ REST })
                const server = aServer()

                // when
                generateEndpoints({ herbarium, server })

                // then
                const { path, method: verb, controller } = server.endpoints[0]
                assert.equal(path, '/updateEntities/:id')
                assert.equal(method, 'PUT')
                assert.deepEqual(await controller({ params: { id: 1 }, body: { name: 'Jane' } }), { id: 1, name: 'Jane', usecaseDesc: `${method} Usecase`, user: 'Bob' })
            })

            it('for a DELETE', async () => {
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
                    controller: ({ usecase, request, authorizationInfo }) => ({ id: request.req.params.id, usecaseDesc: usecase().description, user: authorizationInfo })
                }]
                herbarium.usecases.get(`${method}Usecase`).metadata({ REST })
                const server = aServer()

                // when
                generateEndpoints({ herbarium, server })

                // then
                const { path, method: verb, controller } = server.endpoints[0]
                assert.equal(path, '/deleteEntities/:id')
                assert.equal(method, 'DELETE')
                assert.deepEqual(await controller({ params: { id: 1 } }), { id: 1, usecaseDesc: `${method} Usecase`, user: 'Bob' })
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
                assert.equal(server.path, undefined)
                assert.equal(server.method, undefined)
                assert.equal(server.controller, undefined)
            })

            it('when the use case has an empty REST metadata', () => {
                // given
                herbarium.reset()
                const method = 'GET'
                anUseCase({ method })
                const REST = [{}]
                herbarium.usecases.get(`${method}Usecase`).metadata({ REST })
                const server = aServer()

                // when
                generateEndpoints({ herbarium, server })

                // then 
                assert.equal(server.path, undefined)
                assert.equal(server.method, undefined)
                assert.equal(server.controller, undefined)
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
                herbarium.usecases.get(`${method}Usecase`).metadata({ REST })
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
                herbarium.usecases.get(`${method}Usecase`).metadata({ REST })
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
                herbarium.usecases.get(`${method}Usecase`).metadata({ REST })
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
                herbarium.usecases.get(`${method}Usecase`).metadata({ REST })
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
                herbarium.usecases.get(`${method}Usecase`).metadata({ REST })
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
                parametersHandler: (req, parameters) => ({ req, parameters }),
                authorizationHandler: (_) => 'Bob',
                controller: ({ usecase, request, authorizationInfo }) => ({ id1: request.req.params.id1, usecaseDesc: usecase().description, user: authorizationInfo })
            },
            {
                method: 'POST',
                path: '/readEntitiesTest',
                parameters: { body: { name: Number } },
                parametersHandler: (req, parameters) => ({ req, parameters }),
                authorizationHandler: (_) => 'Jhon',
                controller: ({ usecase, request, authorizationInfo }) => ({ id1: request.req.params.id1, usecaseDesc: usecase().description, user: authorizationInfo })
            }]
            herbarium.usecases.get(`${method}Usecase`).metadata({ REST })
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
            herbarium.usecases.get(`GETUsecase`).metadata({
                REST: [{
                    method: 'GET',
                    path: '/samePath',
                    parameters: { body: { name: String } },
                    parametersHandler: (req, parameters) => ({ req, parameters }),
                    authorizationHandler: (_) => 'Bob',
                    controller: () => { }
                }]
            })
            herbarium.usecases.get(`POSTUsecase`).metadata({
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
