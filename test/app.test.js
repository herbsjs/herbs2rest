// this is a integration test with populateMetadata, generateEndpoints, controller (defaultController) and use case
// simulating a real application

const { herbarium } = require('@herbsjs/herbarium')
const { usecase, step, Ok, Err, id, field, entity } = require('@herbsjs/herbs')
const { generateEndpoints } = require('../src/generateEndpoints')
const { populateMetadata } = require('../src/populateMetadata')
const assert = require('assert').strict

const anEntity = ({ name = 'An Entity', fields }) => {
    const defaultFields = { id: id(Number), name: field(String) }
    fields = fields || defaultFields
    const anEntity = entity(`${name}`, fields)
    herbarium.nodes.add(`${name}`, anEntity, herbarium.node.entity)
    return { entity: anEntity }
}

const anUseCase = ({ crud = herbarium.crud.read, entity, group = 'An Group', request, stepReturn }) => {

    // a request for each CRUD operation
    const crud2request = {
        [herbarium.crud.read]: { id: Number },
        [herbarium.crud.readAll]: { limit: Number, offset: Number },
        [herbarium.crud.create]: { name: String },
        [herbarium.crud.update]: { id: Number, name: String },
        [herbarium.crud.delete]: { id: Number }
    }

    request = request || crud2request[crud] || { id: Number }

    const anUC = () => usecase(`${crud} Usecase`, {
        request,
        authorize: async _ => Ok(),
        'A Step': step(ctx => stepReturn(ctx))
    })

    herbarium.nodes
        .add(`${crud}Usecase`, anUC, herbarium.node.usecase)
        .link(`${entity.name}`)
        .metadata({ operation: crud })

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
function aResponse() {
    return {
        status(code) { this._status = code; return this },
        send(data) { this._data = data; return this },
        json(data) { this._data = data; return this },
        end() { return this },
    }
}

describe('An Herbs2REST App - Integration Test', () => {
    describe('With a simple use case', () => {
        describe('with success', () => {
            it('should create an endpoint for a use case and execute it', async () => {
                // given
                herbarium.reset()
                const { entity } = anEntity({ name: 'TestEntity' })
                anUseCase({
                    entity, stepReturn: (ctx) => {
                        if (ctx.req.id === 1) ctx.ret = { processed: true }
                    }
                })
                const server = aServer()

                // when - setup
                populateMetadata({ herbarium })
                generateEndpoints({ herbarium, server })

                // when - execute
                const expressController = server.endpoints[0].controller
                const req = { params: { id: '1' } }
                const res = aResponse()
                let nextCalled = false
                const next = () => { nextCalled = true }
                await expressController(req, res, next)

                // then
                assert.deepStrictEqual(res._data, { processed: true })
                assert.deepStrictEqual(res._status, 200)
                assert.deepStrictEqual(nextCalled, false)
            })
        })
        describe('with error', () => {
            it('should create an endpoint for a use case and execute it', async () => {
                // given
                herbarium.reset()
                const { entity } = anEntity({ name: 'TestEntity' })
                anUseCase({ entity, stepReturn: (_) => Err({ processed: false }) })
                const server = aServer()

                // when - setup
                populateMetadata({ herbarium })
                generateEndpoints({ herbarium, server })

                // when - execute
                const expressController = server.endpoints[0].controller
                const req = { params: { id: '1' } }
                const res = aResponse()
                let nextCalled = false
                const next = () => { nextCalled = true }
                await expressController(req, res, next)

                // then
                assert.deepStrictEqual(res._data, { error: { processed: false } })
                assert.deepStrictEqual(res._status, 400)
                assert.deepStrictEqual(nextCalled, false)
            })
        })
        describe('with an exception', () => {
            it('should create an endpoint for a use case and execute it', async () => {
                // given
                herbarium.reset()
                const { entity } = anEntity({ name: 'TestEntity' })
                anUseCase({ entity, stepReturn: (_) => { throw new Error('Error') } })
                const server = aServer()

                // when - setup
                populateMetadata({ herbarium })
                generateEndpoints({ herbarium, server })

                // when - execute
                const expressController = server.endpoints[0].controller
                const req = { params: { id: '1' } }
                const res = aResponse()
                let nextCalled = false
                const next = () => { nextCalled = true }
                await expressController(req, res, next)

                // then
                assert.deepStrictEqual(res._data, { error: 'Error', message: 'Error' })
                assert.deepStrictEqual(res._status, 500)
                assert.deepStrictEqual(nextCalled, true)
            })
        })

    })

    describe('With a complex use case', () => {
        describe('With complex request types (arrays and entities)', () => {
            it('should create an endpoint for a use case and execute it', async () => {
                // given
                herbarium.reset()
                const { entity: Customer } = anEntity({ name: 'TestEntity', fields: { id: id(Number), name: field(String), age: field(Number) } })
                const { entity } = anEntity({ name: 'TestEntity2', fields: { id: id(Number), name: field(String), hobbies: field([String]), customers: field([Customer]), customer: field(Customer) } })

                anUseCase({
                    entity,
                    crud: herbarium.crud.update,
                    request: { id: Number, name: String, hobbies: [String], customers: [Customer], customer: Customer, noCustomer: Customer, noCustomers: [Customer] },
                    stepReturn: (ctx) => {
                        ctx.ret = {
                            id: ctx.req.id,
                            name: ctx.req.name,
                            hobbies: ctx.req.hobbies,
                            customers: ctx.req.customers,
                            customer: ctx.req.customer
                        }
                    }
                })
                const server = aServer()

                // when - setup
                populateMetadata({ herbarium })
                generateEndpoints({ herbarium, server })

                // when - execute
                const expressController = server.endpoints[0].controller
                const req = {
                    params: { id: '1' },
                    body: {
                        id: '1', name: 'Test', hobbies: ['hobby1', 'hobby2'],
                        customers: [{ id: '2', name: 'Test 1', age: '20' }, { id: '4', name: 'Test 4', age: '40' }],
                        customer: { id: '3', name: 'Test 2', age: '10' },
                        noCustomer: null,
                        noCustomers: []
                    }
                }
                const res = aResponse()
                let nextCalled = false
                const next = () => { nextCalled = true }
                await expressController(req, res, next)

                // then
                assert.deepStrictEqual(JSON.stringify(res._data), JSON.stringify({
                    id: 1,
                    name: 'Test',
                    hobbies: ['hobby1', 'hobby2'],
                    customers: [{ id: '2', name: 'Test 1', age: '20' }, { id: '4', name: 'Test 4', age: '40' }],
                    customer: { id: '3', name: 'Test 2', age: '10' }
                }))
                assert.deepStrictEqual(res._status, 200)
                assert.deepStrictEqual(nextCalled, false)
            })

        })

        describe('With complex entity field types', () => { })

        describe('With complex req', () => {
            it('should create an endpoint for a use case and execute it', async () => {
                // given
                herbarium.reset()
                const { entity } = anEntity({ name: 'TestEntity', fields: { id: id(Number), name: field(String), age: field(Number) } })
                anUseCase({ entity, crud: herbarium.crud.update, request: { id: Number, name: String, age: Number }, stepReturn: (ctx) => { ctx.ret = { processed: true } } })
                const server = aServer()

                // when - setup
                populateMetadata({ herbarium })
                generateEndpoints({ herbarium, server })

                // when - execute
                const expressController = server.endpoints[0].controller
                const req = { params: { id: '1' }, body: { name: 'John', age: 20 } }
                const res = aResponse()
                const next = function () { this._called = true }
                await expressController(req, res, next)

                // then
                assert.deepStrictEqual(res._status, 200)
                assert.deepStrictEqual(res._data, { processed: true })
                assert.deepStrictEqual(next._called, undefined)
            })

        })

        describe('With multiple versions', () => {
            it('should create multiple endpoints for a use case and execute it', async () => {
                // given 
                herbarium.reset()
                const { entity } = anEntity({ name: 'TestEntity', fields: { id: id(Number), name: field(String), age: field(Number) } })
                anUseCase({ entity, crud: herbarium.crud.update, request: { id: Number, name: String, age: Number }, stepReturn: (ctx) => { ctx.ret = { processed: true } } })
                const server = aServer()

                herbarium.nodes.get('UpdateUsecase').metadata({ REST: [{ version: 'v3' }] })

                // when - setup 
                populateMetadata({ herbarium, version: 'v1' })
                populateMetadata({ herbarium, version: 'v2' })
                generateEndpoints({ herbarium, server })

                // when - execute for each version
                for (const endpoint of server.endpoints) {
                    const expressController = endpoint.controller

                    const req = { params: { id: '1' }, body: { name: 'John', age: 20 } }
                    const res = aResponse()
                    const next = function () { this._called = true }
                    await expressController(req, res, next)
                    // then 
                    assert.deepStrictEqual(res._status, 200)
                    assert.deepStrictEqual(res._data, { processed: true })
                    assert.deepStrictEqual(next._called, undefined)
                }

            })
        })

    })

})