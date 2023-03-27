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

        herbarium.usecases.add(anUC, `${method}Usecase`)

        return { anUC, herbarium }
    }

    function aServer() {
        const server = {
            get path() { return this._path },
            get method() { return this._method },
            get controller() { return this._controller },
            get(path, controller) { this._path = path; this._method = 'GET'; this._controller = controller },
            post(path, controller) { this._path = path; this._method = 'POST'; this._controller = controller },
            put(path, controller) { this._path = path; this._method = 'PUT'; this._controller = controller },
            delete(path, controller) { this._path = path; this._method = 'DELETE'; this._controller = controller }
        }
        return server
    }

    describe('when a use case has all the basic REST metadata', () => {
        describe('should generate the endpoint', () => {
            it('for a GET', async () => {
                // given
                herbarium.reset()
                const method = 'GET'
                const { uc } = anUseCase({ method })
                const controller = (usecase, req, user, res, next, methodName) =>
                    ({ id1: req.id1, usecaseDesc: usecase().description, user })
                const REST = {
                    method,
                    path: '/readEntities/:id',
                    parameters: { params: { id1: Number } },
                    parametersHandler: (req, parameters) => ({ req, parameters }),
                    userHandler: (req) => 'Bob',
                    controller: (usecase, req, user, res, next, methodName) => ({ id1: req.req.params.id1, usecaseDesc: usecase().description, user })
                }
                herbarium.usecases.get(`${method}Usecase`).metadata({ REST })
                const server = aServer()

                // when
                generateEndpoints({ herbarium, server })

                // then
                assert.equal(server.path, '/readEntities/:id')
                assert.equal(server.method, 'GET')
                assert.deepEqual(await server.controller({ params: { id1: 1 } }), { id1: 1, usecaseDesc: `${method} Usecase`, user: 'Bob' })
            })

            it('for a GET (all)', async () => {
                // given
                herbarium.reset()
                const method = 'GET'
                const { uc } = anUseCase({ method })
                const controller = (usecase, req, user, res, next, methodName) =>
                    ({ id1: req.id1, usecaseDesc: usecase().description, user })
                const REST = {
                    method,
                    path: '/readEntities',
                    parameters: { query: { id1: Number } },
                    parametersHandler: (req, parameters) => ({ req, parameters }),
                    userHandler: (req) => 'Bob',
                    controller: (usecase, req, user, res, next, methodName) => ({ id1: req.req.query.id1, usecaseDesc: usecase().description, user })
                }
                herbarium.usecases.get(`${method}Usecase`).metadata({ REST })
                const server = aServer()

                // when
                generateEndpoints({ herbarium, server })

                // then
                assert.equal(server.path, '/readEntities')
                assert.equal(server.method, 'GET')
                assert.deepEqual(await server.controller({ query: { id1: 1 } }), { id1: 1, usecaseDesc: `${method} Usecase`, user: 'Bob' })
            })

            it('for a POST', async () => {
                // given
                herbarium.reset()
                const method = 'POST'
                const { uc } = anUseCase({ method })
                const controller = (usecase, req, user, res, next, methodName) =>
                    ({ name: req.name, usecaseDesc: usecase().description, user })
                const REST = {
                    method,
                    path: '/createEntities',
                    parameters: { body: { name: String } },
                    parametersHandler: (req, parameters) => ({ req, parameters }),
                    userHandler: (req) => 'Bob',
                    controller: (usecase, req, user, res, next, methodName) => ({ name: req.req.body.name, usecaseDesc: usecase().description, user })
                }
                herbarium.usecases.get(`${method}Usecase`).metadata({ REST })
                const server = aServer()

                // when
                generateEndpoints({ herbarium, server })

                // then
                assert.equal(server.path, '/createEntities')
                assert.equal(server.method, 'POST')
                assert.deepEqual(await server.controller({ body: { name: 'Jane' } }), { name: 'Jane', usecaseDesc: `${method} Usecase`, user: 'Bob' })
            })

            it('for a PUT', async () => {
                // given
                herbarium.reset()
                const method = 'PUT'
                const { uc } = anUseCase({ method })
                const controller = (usecase, req, user, res, next, methodName) =>
                    ({ id: req.id, name: req.name, usecaseDesc: usecase().description, user })
                const REST = {
                    method,
                    path: '/updateEntities/:id',
                    parameters: { params: { id: Number }, body: { name: String } },
                    parametersHandler: (req, parameters) => ({ req, parameters }),
                    userHandler: (req) => 'Bob',
                    controller: (usecase, req, user, res, next, methodName) => ({ id: req.req.params.id, name: req.req.body.name, usecaseDesc: usecase().description, user })
                }
                herbarium.usecases.get(`${method}Usecase`).metadata({ REST })
                const server = aServer()

                // when
                generateEndpoints({ herbarium, server })

                // then
                assert.equal(server.path, '/updateEntities/:id')
                assert.equal(server.method, 'PUT')
                assert.deepEqual(await server.controller({ params: { id: 1 }, body: { name: 'Jane' } }), { id: 1, name: 'Jane', usecaseDesc: `${method} Usecase`, user: 'Bob' })
            })

            it('for a DELETE', async () => {
                // given
                herbarium.reset()
                const method = 'DELETE'
                const { uc } = anUseCase({ method })
                const controller = (usecase, req, user, res, next, methodName) =>
                    ({ id: req.id, usecaseDesc: usecase().description, user })
                const REST = {
                    method,
                    path: '/deleteEntities/:id',
                    parameters: { params: { id: Number } },
                    parametersHandler: (req, parameters) => ({ req, parameters }),
                    userHandler: (req) => 'Bob',
                    controller: (usecase, req, user, res, next, methodName) => ({ id: req.req.params.id, usecaseDesc: usecase().description, user })
                }
                herbarium.usecases.get(`${method}Usecase`).metadata({ REST })
                const server = aServer()

                // when
                generateEndpoints({ herbarium, server })

                // then
                assert.equal(server.path, '/deleteEntities/:id')
                assert.equal(server.method, 'DELETE')
                assert.deepEqual(await server.controller({ params: { id: 1 } }), { id: 1, usecaseDesc: `${method} Usecase`, user: 'Bob' })
            })
        })
    })

    describe('when a use case has a missing basic REST metadata', () => {
        describe('should not generate the endpoint', () => {
            it('when the use case is not a REST use case', () => {
                // given
                herbarium.reset()
                const { uc } = anUseCase({ method: 'GET' })
                const server = aServer()
                const controller = (usecase, req, user, res, next, methodName) =>
                    ({ id1: req.req.query.id1, usecaseDesc: usecase().description, user })

                // when
                // then 
                assert.throws(() => generateEndpoints({ herbarium, server }), /Error: No REST metadata for usecase GETUsecase/)
            })
            it('when the use case has no method', () => {
                // given
                herbarium.reset()
                const method = 'DELETE'
                const { uc } = anUseCase({ method })
                const controller = (usecase, req, user, res, next, methodName) =>
                    ({ id: req.id, usecaseDesc: usecase().description, user })
                const REST = {
                    path: '/deleteEntities/:id',
                    parameters: { params: { id: Number } },
                    parametersHandler: (req, parameters) => ({ req, parameters }),
                    userHandler: (req) => 'Bob',
                    controller: (usecase, req, user, res, next, methodName) => ({ id: req.req.params.id, usecaseDesc: usecase().description, user })
                }
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
                const { uc } = anUseCase({ method })
                const controller = (usecase, req, user, res, next, methodName) =>
                    ({ id: req.id, usecaseDesc: usecase().description, user })
                const REST = {
                    method,
                    parameters: { params: { id: Number } },
                    parametersHandler: (req, parameters) => ({ req, parameters }),
                    userHandler: (req) => 'Bob',
                    controller: (usecase, req, user, res, next, methodName) => ({ id: req.req.params.id, usecaseDesc: usecase().description, user })
                }
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
                const { uc } = anUseCase({ method })
                const controller = (usecase, req, user, res, next, methodName) =>
                    ({ id: req.id, usecaseDesc: usecase().description, user })
                const REST = {
                    method,
                    path: '/deleteEntities/:id',
                    parametersHandler: (req, parameters) => ({ req, parameters }),
                    userHandler: (req) => 'Bob',
                    controller: (usecase, req, user, res, next, methodName) => ({ id: req.req.params.id, usecaseDesc: usecase().description, user })
                }
                herbarium.usecases.get(`${method}Usecase`).metadata({ REST })
                const server = aServer()

                // when
                // then 
                assert.throws(() => generateEndpoints({ herbarium, server }), /Error: 'parameters' metadata is required. It is not possible to generate a REST endpoint for usecase DELETEUsecase./)

            })
            it('when the use case has no userHandler', () => {
                // given
                herbarium.reset()
                const method = 'DELETE'
                const { uc } = anUseCase({ method })
                const controller = (usecase, req, user, res, next, methodName) =>
                    ({ id: req.id, usecaseDesc: usecase().description, user })
                const REST = {
                    method,
                    path: '/deleteEntities/:id',
                    parameters: { params: { id: Number } },
                    parametersHandler: (req, parameters) => ({ req, parameters }),
                    controller: (usecase, req, user, res, next, methodName) => ({ id: req.req.params.id, usecaseDesc: usecase().description, user })
                }
                herbarium.usecases.get(`${method}Usecase`).metadata({ REST })
                const server = aServer()

                // when
                // then 
                assert.throws(() => generateEndpoints({ herbarium, server }), /Error: 'userHandler' metadata is required. It is not possible to generate a REST endpoint for usecase DELETEUsecase./)
            })
            it('when the use case has no controller', () => {
                // given
                herbarium.reset()
                const method = 'DELETE'
                const { uc } = anUseCase({ method })
                const REST = {
                    method,
                    path: '/deleteEntities/:id',
                    parameters: { params: { id: Number } },
                    parametersHandler: (req, parameters) => ({ req, parameters }),
                    userHandler: (req) => 'Bob',
                }
                herbarium.usecases.get(`${method}Usecase`).metadata({ REST })
                const server = aServer()

                // when
                // then 
                assert.throws(() => generateEndpoints({ herbarium, server }), /Error: 'controller' metadata is required. It is not possible to generate a REST endpoint for usecase DELETEUsecase./)
            })
        })
    })

    describe.only('when a more than one use case has the same endpoint (method and path)', () => {
        it('should throw an error', () => {
            // given
            herbarium.reset()
            const { uc: uc1 } = anUseCase({ method: 'GET' })
            const { uc: uc2 } = anUseCase({ method: 'POST' })
            const server = aServer()
            herbarium.usecases.get(`GETUsecase`).metadata({
                REST: {
                    method: 'GET',
                    path: '/samePath',
                    parameters: { body: { name: String } },
                    parametersHandler: (req, parameters) => ({ req, parameters }),
                    userHandler: (req) => 'Bob',
                    controller: (usecase, req, user, res, next, methodName) => ({ name: req.req.body.name, usecaseDesc: usecase().description, user })
                }
            })
            herbarium.usecases.get(`POSTUsecase`).metadata({
                REST: {
                    method: 'GET',
                    path: '/samePath',
                    parameters: { body: { name: String } },
                    parametersHandler: (req, parameters) => ({ req, parameters }),
                    userHandler: (req) => 'Bob',
                    controller: (usecase, req, user, res, next, methodName) => ({ name: req.req.body.name, usecaseDesc: usecase().description, user })
                }
            })

            // when
            // then 
            assert.throws(() => generateEndpoints({ herbarium, server }), /Error: It is not possible to generate a REST endpoint for usecase \'POSTUsecase\'. There is already an endpoint for method GET and path \/samePath generated by usecase \'GETUsecase\'/)
        })
    })
})
