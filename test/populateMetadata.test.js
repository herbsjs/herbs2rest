const { herbarium } = require('@herbsjs/herbarium')
const { entity, id, field } = require('@herbsjs/herbs')
const { usecase, step, Ok } = require('@herbsjs/herbs')
const { populateMetadata } = require('../src/populateMetadata.js')
const assert = require('assert').strict

describe('populateMetadata', () => {

    const anEntity = ({ name, fields }) => {
        const defaultFields = { id: id(Number), name: field(String) }
        fields = fields || defaultFields
        const anEntity = entity(`${name}`, fields)
        herbarium.entities.add(anEntity, 'Test')
        return { entity: anEntity, herbarium }
    }

    const anUseCase = ({ crud, entity, group = 'Test', request }) => {

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
            'A Step': step(_ => Ok())
        })

        herbarium.usecases
            .add(anUC, `${crud}Usecase`)
            .metadata({ group, operation: crud, entity })

        return { anUC, herbarium }
    }

    describe('must accept a herbarium instance', () => {
        it('should throw an error if herbarium is not provided', () => {
            assert.throws(() =>
                populateMetadata({}),
                { message: 'herbarium is required' })
        })
    })

    describe('should accept a custom controller for all endpoints', () => {
        it('should return the correct controller', () => {
            // given
            herbarium.reset()
            const appDefaultController = () => 2
            const { entity } = anEntity({ name: 'Entity' })
            anUseCase({ crud: herbarium.crud.read, entity })
            anUseCase({ crud: herbarium.crud.update, entity })

            // when
            populateMetadata({ herbarium, controller: appDefaultController })

            // then
            const [metadata1] = herbarium.usecases.get('ReadUsecase').REST
            assert.deepStrictEqual(metadata1.controller(), 2)
            const [metadata2] = herbarium.usecases.get('UpdateUsecase').REST
            assert.deepStrictEqual(metadata2.controller(), 2)
        })
    })

    describe('should accept a versions info for all endpoints', () => {
        it('should return the correct metadata', () => {
            // given
            herbarium.reset()
            const { entity } = anEntity({ name: 'Entity' })
            anUseCase({ crud: herbarium.crud.read, entity })
            anUseCase({ crud: herbarium.crud.update, entity })

            // when
            populateMetadata({ herbarium, version: 'v1' })

            // then
            const [metadata1] = herbarium.usecases.get('ReadUsecase').REST
            assert.deepStrictEqual(metadata1.version, 'v1')
            const [metadata2] = herbarium.usecases.get('UpdateUsecase').REST
            assert.deepStrictEqual(metadata2.version, 'v1')
        })
    })

    describe('should accept a alternative convention', () => {
        it('should return the correct metadata respecting the new convention', () => {
            // given
            herbarium.reset()
            const { entity } = anEntity({ name: 'Entity' })
            anUseCase({ crud: herbarium.crud.read, entity })

            // clone the default convention and change the toPlural method
            const newConvention = Object.assign({}, populateMetadata.convention)
            newConvention.toPlural = (name) => name.toLowerCase() + ' plural'

            // when
            populateMetadata({ herbarium, convention: newConvention })

            // then
            const [metadata] = herbarium.usecases.get('ReadUsecase').REST
            assert.equal(metadata.method, 'GET')
            assert.equal(metadata.resource, 'entityPlural')
            assert.equal(metadata.path, '/entityPlural/:id')
            assert.equal(typeof metadata.controller, 'function')
            assert.deepEqual(metadata.parameters, { params: { id: Number } })
        })
    })

    describe('should populate REST metadata for a use case with domain metadata only', () => {
        describe('CRUD info', () => {
            const testCases = [
                {
                    operation: herbarium.crud.read,
                    entityName: 'Read Entity',
                    method: 'GET',
                    resource: 'readEntities',
                    path: '/readEntities/:id',
                    parameters: { params: { id: Number } },
                    req: { params: { id: 1 } },
                    resultReq: { id: 1 }
                },
                {
                    operation: herbarium.crud.readAll,
                    entityName: 'Read All Entity',
                    method: 'GET',
                    resource: 'readAllEntities',
                    path: '/readAllEntities',
                    parameters: { query: { limit: Number, offset: Number } },
                    req: { query: { limit: 10, offset: 0 } },
                    resultReq: { limit: 10, offset: 0 }
                },
                {
                    operation: herbarium.crud.create,
                    entityName: 'Create Entity',
                    method: 'POST',
                    resource: 'createEntities',
                    path: '/createEntities',
                    parameters: { body: { name: String } },
                    req: { body: { name: 'Jane' } },
                    resultReq: { name: 'Jane' }
                },
                {
                    operation: herbarium.crud.update,
                    entityName: 'Update Entity',
                    method: 'PUT',
                    resource: 'updateEntities',
                    path: '/updateEntities/:id',
                    parameters: { params: { id: Number }, body: { name: String } },
                    req: { params: { id: 1 }, body: { name: 'Jane' } },
                    resultReq: { id: 1, name: 'Jane' }
                },
                {
                    operation: herbarium.crud.delete,
                    entityName: 'Delete Entity',
                    method: 'DELETE',
                    resource: 'deleteEntities',
                    path: '/deleteEntities/:id',
                    parameters: { params: { id: Number } },
                    req: { params: { id: 1 } },
                    resultReq: { id: 1 }
                }
            ]

            testCases.forEach(({ operation, entityName, method, resource, path, parameters, req, resultReq }) => {
                it(`should populate metadata for ${operation}`, () => {
                    // given
                    herbarium.reset()
                    const { entity } = anEntity({ name: entityName })
                    const { anUC } = anUseCase({ crud: operation, entity })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const usecaseName = `${operation}Usecase`
                    const [metadata] = herbarium.usecases.get(usecaseName).REST
                    assert.equal(metadata.version, '')
                    assert.equal(metadata.method, method)
                    assert.equal(metadata.resource, resource)
                    assert.equal(metadata.path, path)
                    assert.equal(typeof metadata.controller, 'function')
                    assert.deepEqual(metadata.parameters, parameters)
                    assert.deepEqual(metadata.parametersHandler(anUC, req, parameters), resultReq)
                    assert.equal(metadata.authorizationHandler({ authInfo: 'bob' }), 'bob')
                })
            })
        })

        describe('Non-CRUD operations', () => {
            const testCases = [
                {
                    operation: herbarium.crud.other,
                    entityName: 'Other Entity',
                    method: 'POST',
                    resource: 'otherEntities',
                    path: '/otherEntities',
                    parameters: { body: { id: Number } },
                    req: { body: { id: 1 } },
                    resultReq: { id: 1 }
                },
                {
                    operation: undefined,
                    entityName: 'Not Defined Entity',
                    method: 'POST',
                    resource: 'notDefinedEntities',
                    path: '/notDefinedEntities',
                    parameters: { body: { id: Number } },
                    req: { body: { id: 1 } },
                    resultReq: { id: 1 }
                }
            ]

            testCases.forEach(({ operation, entityName, method, resource, path, parameters, req, resultReq }) => {
                it(`should populate metadata for ${operation}`, () => {
                    // given
                    herbarium.reset()
                    const { entity } = anEntity({ name: entityName })
                    const { anUC } = anUseCase({ crud: operation, entity })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const usecaseName = `${operation}Usecase`
                    const [metadata] = herbarium.usecases.get(usecaseName).REST

                    assert.equal(metadata.version, '')
                    assert.equal(metadata.method, method)
                    assert.equal(metadata.resource, resource)
                    assert.equal(metadata.path, path)
                    assert.equal(typeof metadata.controller, 'function')
                    assert.deepEqual(metadata.parameters, parameters)
                    assert.deepEqual(metadata.parametersHandler(anUC, req, parameters), resultReq)
                    assert.equal(metadata.authorizationHandler({ authInfo: 'bob' }), 'bob')
                })
            })
        })

        describe('Resource Name Convention - Entity Name and Group', () => {
            it('with entity and group', () => {
                // given
                herbarium.reset()
                const operation = herbarium.crud.read
                const { entity } = anEntity({ name: `${operation} Entity` })
                anUseCase({ crud: operation, entity })

                // when
                populateMetadata({ herbarium })

                // then
                const usecaseName = `${operation}Usecase`
                const [metadata] = herbarium.usecases.get(usecaseName).REST
                assert.equal(metadata.resource, 'readEntities')
            })
            it('with entity and no group', () => {
                // given
                herbarium.reset()
                const operation = herbarium.crud.read
                const { entity } = anEntity({ name: `${operation} Entity` })
                anUseCase({ crud: operation, entity, group: undefined })

                // when
                populateMetadata({ herbarium })

                // then
                const usecaseName = `${operation}Usecase`
                const [metadata] = herbarium.usecases.get(usecaseName).REST
                assert.equal(metadata.resource, 'readEntities')
            })
            it('with no entity and group', () => {
                // given
                herbarium.reset()
                const operation = herbarium.crud.read
                anEntity({ name: `${operation} Entity` })
                anUseCase({ crud: operation, entity: undefined, group: 'The Group' })

                // when
                populateMetadata({ herbarium })

                // then
                const usecaseName = `${operation}Usecase`
                const [metadata] = herbarium.usecases.get(usecaseName).REST
                assert.equal(metadata.resource, 'theGroups')
            })
            it('with no entity and no group', () => {
                // given
                herbarium.reset()
                const operation = herbarium.crud.read
                anUseCase({ crud: operation, entity: undefined, group: null })

                // when
                // then
                assert.throws(() => { populateMetadata({ herbarium }) },
                    /^Error: Invalid Resource. It is not possible to generate a REST resource name for usecase ReadUsecase. Please, add a group or entity to the usecase metadata.$/)

            })
        })

        describe('Parameters Convention - Use Case Request and Entity Fields', () => {
            describe('Names', () => {
                it('with IDs with no-"ID" name', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity`, fields: { idName: id(Number), name: field(String) } })
                    const request = { idName: Number, name: String }
                    anUseCase({ crud: operation, entity, request })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const usecaseName = `${operation}Usecase`
                    const [metadata] = herbarium.usecases.get(usecaseName).REST
                    assert.deepEqual(metadata.parameters, { params: { idName: Number }, query: { name: String } })
                    assert.equal(metadata.path, '/readEntities/:idName')
                })

                it('with an entity with no ID', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity`, fields: { name: field(String) } })
                    const request = { id: Number, name: String }
                    anUseCase({ crud: operation, entity, request })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const usecaseName = `${operation}Usecase`
                    const [metadata] = herbarium.usecases.get(usecaseName).REST
                    assert.deepEqual(metadata.parameters, { query: { id: Number, name: String } })
                    assert.equal(metadata.path, '/readEntities')
                })

                it('with an entity with multiple IDs', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity`, fields: { id1: id(Number), id2: id(Number), name: field(String) } })
                    const request = { id1: Number, id2: Number, name: String }
                    anUseCase({ crud: operation, entity, request })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const usecaseName = `${operation}Usecase`
                    const [metadata] = herbarium.usecases.get(usecaseName).REST
                    assert.deepEqual(metadata.parameters, { params: { id1: Number, id2: Number }, query: { name: String } })
                    assert.equal(metadata.path, '/readEntities/:id1/:id2')
                })

                it('with an entity with multiple IDs but with partial intersection with use case request', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity`, fields: { id1: id(Number), id2: id(Number), name: field(String) } })
                    const request = { id1: Number, id3: Number, name: String }
                    anUseCase({ crud: operation, entity, request })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const usecaseName = `${operation}Usecase`
                    const [metadata] = herbarium.usecases.get(usecaseName).REST
                    assert.deepEqual(metadata.parameters, { params: { id1: Number }, query: { id3: Number, name: String } })
                    assert.equal(metadata.path, '/readEntities/:id1')
                })
            })
            describe('Types', () => {

                it('with all native types', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({
                        name: `${operation} Entity`, fields: {
                            id: id(Number),
                            name: field(String),
                            age: field(Number),
                            isAdult: field(Boolean),
                            birthDate: field(Date),
                            address: field(Object),
                            hobbies: field(Array)
                        }
                    })
                    const request = {
                        id: Number,
                        name: String,
                        age: Number,
                        isAdult: Boolean,
                        birthDate: Date,
                        address: Object,
                        hobbies: Array
                    }
                    anUseCase({ crud: operation, entity, request })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const usecaseName = `${operation}Usecase`
                    const [metadata] = herbarium.usecases.get(usecaseName).REST
                    assert.deepEqual(metadata.parameters, { params: { id: Number }, query: { name: String, age: Number, isAdult: Boolean, birthDate: Date, address: Object, hobbies: Array } })
                    assert.equal(metadata.path, '/readEntities/:id')
                })

                it('with all native types as arrays', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({
                        name: `${operation} Entity`, fields: {
                            id: id([Number]),
                            name: field([String]),
                            age: field([Number]),
                            isAdult: field([Boolean]),
                            birthDate: field([Date]),
                            address: field([Object]),
                            hobbies: field([Array])
                        }
                    })
                    const request = {
                        id: [Number],
                        name: [String],
                        age: [Number],
                        isAdult: [Boolean],
                        birthDate: [Date],
                        address: [Object],
                        hobbies: [Array]
                    }
                    anUseCase({ crud: operation, entity, request })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const usecaseName = `${operation}Usecase`
                    const [metadata] = herbarium.usecases.get(usecaseName).REST
                    assert.deepEqual(metadata.parameters, { params: { id: [Number] }, query: { name: [String], age: [Number], isAdult: [Boolean], birthDate: [Date], address: [Object], hobbies: [Array] } })
                    assert.equal(metadata.path, '/readEntities/:id')
                })

                it('with entity on request', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({
                        name: `${operation} Entity`, fields: {
                            id: id(Number),
                            name: field(String)
                        }
                    })
                    const { entity: Customer } = anEntity({
                        name: `Customer`, fields: {
                            id: id(Number),
                            description: field(String),
                            age: field(Number)
                        }
                    })
                    const { entity: Order } = anEntity({
                        name: `Order`, fields: {
                            id1: id(Number),
                            id2: id(Number),
                            amount: field(Number),
                        }
                    })

                    const request = {
                        id: Number,
                        name: String,
                        customer: Customer,
                        customers: [Customer],
                        order: Order,
                        orders: [Order]
                    }
                    anUseCase({ crud: operation, entity, request })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const usecaseName = `${operation}Usecase`
                    const [metadata] = herbarium.usecases.get(usecaseName).REST
                    assert.deepEqual(metadata.parameters, {
                        params: { id: Number }, query: {
                            name: String,
                            customer: { id: Number },
                            customers: [{ id: Number }],
                            order: { id1: Number, id2: Number },
                            orders: [{ id1: Number, id2: Number }]
                        }
                    })
                    assert.equal(metadata.path, '/readEntities/:id')
                })

            })

            describe('Version', () => {
                it('with versioning', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity` })
                    anUseCase({ crud: operation, entity })
                    const usecaseName = `${operation}Usecase`
                    herbarium.usecases.get(usecaseName).metadata({ REST: [{ version: 'v2' }] })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const [metadata] = herbarium.usecases.get(usecaseName).REST
                    assert.equal(metadata.method, 'GET')
                    assert.equal(metadata.resource, 'readEntities')
                    assert.equal(metadata.path, '/v2/readEntities/:id')
                })

                it('with versioning empty', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity` })
                    anUseCase({ crud: operation, entity })
                    const usecaseName = `${operation}Usecase`
                    herbarium.usecases.get(usecaseName).metadata({ REST: [{ version: '' }] })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const [metadata] = herbarium.usecases.get(usecaseName).REST
                    assert.equal(metadata.method, 'GET')
                    assert.equal(metadata.resource, 'readEntities')
                    assert.equal(metadata.path, '/readEntities/:id')
                })
            })
        })
    })

    describe('should populate metadata for a use case with overridden of metadata', () => {
        describe('overridden REST metadata', () => {
            describe('Resource', () => {
                it('with resource', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity` })
                    anUseCase({ crud: operation, entity })
                    const usecaseName = `${operation}Usecase`
                    herbarium.usecases.get(usecaseName).metadata({ REST: [{ resource: 'overriddenResource' }] })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const [metadata] = herbarium.usecases.get(usecaseName).REST
                    assert.equal(metadata.method, 'GET')
                    assert.equal(metadata.resource, 'overriddenResource')
                    assert.equal(metadata.path, '/overriddenResource/:id')
                    assert.equal(typeof metadata.controller, 'function')
                    assert.deepEqual(metadata.parameters, { params: { id: Number } })
                })
            })
            describe('Method', () => {

                it('with method', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity` })
                    anUseCase({ crud: operation, entity })
                    const usecaseName = `${operation}Usecase`
                    herbarium.usecases.get(usecaseName).metadata({ REST: [{ method: 'POST' }] })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const [metadata] = herbarium.usecases.get(usecaseName).REST
                    assert.equal(metadata.method, 'POST')
                    assert.equal(metadata.resource, 'readEntities')
                    assert.equal(metadata.path, '/readEntities')
                    assert.equal(typeof metadata.controller, 'function')
                    assert.deepEqual(metadata.parameters, { body: { id: Number } })
                })

                it('with invalid method', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity` })
                    anUseCase({ crud: operation, entity })
                    const usecaseName = `${operation}Usecase`
                    herbarium.usecases.get(usecaseName).metadata({ REST: [{ method: 'INVALID' }] })

                    // when
                    // then
                    assert.throws(() => { populateMetadata({ herbarium }) }
                        , /^Error: Invalid Method. It is not possible to populate the REST metadata for usecase ReadUsecase. Please, check the method on the usecase metadata.$/)
                })

            })
            describe('Path', () => {
                it('with path', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity` })
                    anUseCase({ crud: operation, entity })
                    const usecaseName = `${operation}Usecase`
                    herbarium.usecases.get(usecaseName).metadata({ REST: [{ path: '/overriddenPath' }] })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const [metadata] = herbarium.usecases.get(usecaseName).REST
                    assert.equal(metadata.method, 'GET')
                    assert.equal(metadata.resource, 'readEntities')
                    assert.equal(metadata.path, '/overriddenPath')
                    assert.equal(typeof metadata.controller, 'function')
                    assert.deepEqual(metadata.parameters, { params: { id: Number } })
                })
            })
            describe('Controller', () => {
                it('with controller', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity` })
                    anUseCase({ crud: operation, entity })
                    const usecaseName = `${operation}Usecase`
                    herbarium.usecases.get(usecaseName).metadata({ REST: [{ controller: () => 1 }] })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const [metadata] = herbarium.usecases.get(usecaseName).REST
                    assert.equal(metadata.method, 'GET')
                    assert.equal(metadata.resource, 'readEntities')
                    assert.equal(metadata.path, '/readEntities/:id')
                    assert.equal(metadata.controller(), 1)
                    assert.deepEqual(metadata.parameters, { params: { id: Number } })
                })
            })
            describe('Parameters', () => {
                it('with parameters', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity` })
                    anUseCase({ crud: operation, entity })
                    const usecaseName = `${operation}Usecase`
                    herbarium.usecases.get(usecaseName).metadata({ REST: [{ parameters: { query: { id1: Number } } }] })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const [metadata] = herbarium.usecases.get(usecaseName).REST
                    assert.equal(metadata.method, 'GET')
                    assert.equal(metadata.resource, 'readEntities')
                    assert.equal(metadata.path, '/readEntities')
                    assert.equal(typeof metadata.controller, 'function')
                    assert.deepEqual(metadata.parameters, { query: { id1: Number } })
                })
                it('with parameters from different sources', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity` })
                    anUseCase({ crud: operation, entity })
                    const usecaseName = `${operation}Usecase`
                    herbarium.usecases.get(usecaseName).metadata({
                        REST: [{
                            parameters: {
                                query: { id1: Number },
                                params: { id2: String },
                                body: { id3: Boolean },
                                headers: { id4: Date },
                                cookies: { id5: Array },
                                path: { id6: Object },
                                ip: { id7: Number },
                                protocol: { id8: String },
                                secure: { id9: Boolean },
                                xhr: { id10: Date }
                            }
                        }]
                    })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const [metadata] = herbarium.usecases.get(usecaseName).REST
                    assert.equal(metadata.method, 'GET')
                    assert.equal(metadata.resource, 'readEntities')
                    assert.equal(metadata.path, '/readEntities/:id2')
                    assert.equal(typeof metadata.controller, 'function')
                    assert.deepEqual(metadata.parameters, {
                        query: { id1: Number },
                        params: { id2: String },
                        body: { id3: Boolean },
                        headers: { id4: Date },
                        cookies: { id5: Array },
                        path: { id6: Object },
                        ip: { id7: Number },
                        protocol: { id8: String },
                        secure: { id9: Boolean },
                        xhr: { id10: Date }
                    })
                })
            })
            describe('Parameters Handler', () => {
                it('with parameters handler', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity` })
                    anUseCase({ crud: operation, entity })
                    const usecaseName = `${operation}Usecase`
                    herbarium.usecases.get(usecaseName).metadata({ REST: [{ parametersHandler: () => 1 }] })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const [metadata] = herbarium.usecases.get(usecaseName).REST
                    assert.equal(metadata.method, 'GET')
                    assert.equal(metadata.resource, 'readEntities')
                    assert.equal(metadata.path, '/readEntities/:id')
                    assert.equal(typeof metadata.controller, 'function')
                    assert.deepEqual(metadata.parameters, { params: { id: Number } })
                    assert.equal(metadata.parametersHandler(), 1)
                })
            })
            describe('Authorization Handler', () => {
                it('with authorization handler', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity` })
                    anUseCase({ crud: operation, entity })
                    const usecaseName = `${operation}Usecase`
                    herbarium.usecases.get(usecaseName).metadata({ REST: [{ authorizationHandler: () => 'Jane' }] })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const [metadata] = herbarium.usecases.get(usecaseName).REST
                    assert.equal(metadata.method, 'GET')
                    assert.equal(metadata.resource, 'readEntities')
                    assert.equal(metadata.path, '/readEntities/:id')
                    assert.equal(typeof metadata.controller, 'function')
                    assert.deepEqual(metadata.parameters, { params: { id: Number } })
                    assert.equal(metadata.authorizationHandler(), 'Jane')
                })
            })

            describe('All the metadata overridden', () => {
                it('with all the metadata', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity` })
                    anUseCase({ crud: operation, entity })
                    const usecaseName = `${operation}Usecase`
                    herbarium.usecases.get(usecaseName).metadata({
                        REST: [{
                            method: 'POST',
                            path: '/overriddenPath',
                            resource: 'overriddenResource',
                            parameters: { cookie: { id1: Number } },
                            parametersHandler: () => 1,
                            controller: () => 1
                        }]
                    })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const [metadata] = herbarium.usecases.get(usecaseName).REST
                    assert.equal(metadata.method, 'POST')
                    assert.equal(metadata.resource, 'overriddenResource')
                    assert.equal(metadata.path, '/overriddenPath')
                    assert.equal(metadata.controller(), 1)
                    assert.deepEqual(metadata.parameters, { cookie: { id1: Number } })
                    assert.equal(metadata.parametersHandler(), 1)
                })
            })
        })

        describe('should populate multiples endpoints', () => {
            it('with multiples endpoints', () => {
                // given
                herbarium.reset()
                const operation = herbarium.crud.read
                const { entity } = anEntity({ name: `${operation} Entity` })
                anUseCase({ crud: operation, entity })
                const usecaseName = `${operation}Usecase`
                herbarium.usecases.get(usecaseName).metadata({
                    REST: [{ method: 'POST', resource: 'test' },
                    { method: 'GET' }]
                })

                // when
                populateMetadata({ herbarium })

                // then
                const metadata = herbarium.usecases.get(usecaseName).REST
                assert.equal(metadata[0].method, 'POST')
                assert.equal(metadata[0].resource, 'test')
                assert.equal(metadata[0].path, '/test')
                assert.equal(typeof metadata[0].controller, 'function')
                assert.equal(typeof metadata[0].parametersHandler, 'function')
                assert.equal(typeof metadata[0].authorizationHandler, 'function')
                assert.deepEqual(metadata[0].parameters, { body: { id: Number } })
                assert.equal(metadata[1].method, 'GET')
                assert.equal(metadata[1].resource, 'readEntities')
                assert.equal(metadata[1].path, '/readEntities/:id')
                assert.equal(typeof metadata[1].controller, 'function')
                assert.equal(typeof metadata[1].parametersHandler, 'function')
                assert.equal(typeof metadata[1].authorizationHandler, 'function')
                assert.deepEqual(metadata[1].parameters, { params: { id: Number } })

            })

            it('with multiples versions', () => {
                // given
                herbarium.reset()
                const operation = herbarium.crud.read
                const { entity } = anEntity({ name: `${operation} Entity` })
                anUseCase({ crud: operation, entity })
                const usecaseName = `${operation}Usecase`
                herbarium.usecases.get(usecaseName).metadata({
                    REST: [
                        { version: 'v1' },
                        { version: 'v2' }]
                })

                // when
                populateMetadata({ herbarium })

                // then
                const metadata = herbarium.usecases.get(usecaseName).REST
                assert.equal(metadata[0].method, 'GET')
                assert.equal(metadata[0].resource, 'readEntities')
                assert.equal(metadata[0].path, '/v1/readEntities/:id')
                assert.equal(typeof metadata[0].controller, 'function')
                assert.equal(typeof metadata[0].parametersHandler, 'function')
                assert.equal(typeof metadata[0].authorizationHandler, 'function')
                assert.deepEqual(metadata[0].parameters, { params: { id: Number } })
                assert.equal(metadata[1].method, 'GET')
                assert.equal(metadata[1].resource, 'readEntities')
                assert.equal(metadata[1].path, '/v2/readEntities/:id')
                assert.equal(typeof metadata[1].controller, 'function')
                assert.equal(typeof metadata[1].parametersHandler, 'function')
                assert.equal(typeof metadata[1].authorizationHandler, 'function')
                assert.deepEqual(metadata[1].parameters, { params: { id: Number } })
            })

            it('with multiples endpoints and a default version', () => {
                // given
                herbarium.reset()
                const operation = herbarium.crud.read
                const { entity } = anEntity({ name: `${operation} Entity` })
                anUseCase({ crud: operation, entity })
                const usecaseName = `${operation}Usecase`
                herbarium.usecases.get(usecaseName).metadata({
                    REST: [{ version: 'v1', method: 'POST', resource: 'test' },
                    { version: 'v2', method: 'DELETE', resource: 'test2' }]
                })

                // when
                populateMetadata({ herbarium, version: 'v3' })

                // then
                const metadata = herbarium.usecases.get(usecaseName).REST
                assert.equal(metadata[0].method, 'POST')
                assert.equal(metadata[0].resource, 'test')
                assert.equal(metadata[0].path, '/v1/test')
                assert.equal(typeof metadata[0].controller, 'function')
                assert.equal(typeof metadata[0].parametersHandler, 'function')
                assert.equal(typeof metadata[0].authorizationHandler, 'function')
                assert.deepEqual(metadata[0].parameters, { body: { id: Number } })
                assert.equal(metadata[1].method, 'DELETE')
                assert.equal(metadata[1].resource, 'test2')
                assert.equal(metadata[1].path, '/v2/test2/:id')
                assert.equal(typeof metadata[1].controller, 'function')
                assert.equal(typeof metadata[1].parametersHandler, 'function')
                assert.equal(typeof metadata[1].authorizationHandler, 'function')
                assert.deepEqual(metadata[1].parameters, { params: { id: Number } })
                assert.equal(metadata[2].method, 'GET')
                assert.equal(metadata[2].resource, 'readEntities')
                assert.equal(metadata[2].path, '/v3/readEntities/:id')
                assert.equal(typeof metadata[2].controller, 'function')
                assert.equal(typeof metadata[2].parametersHandler, 'function')
                assert.equal(typeof metadata[2].authorizationHandler, 'function')
                assert.deepEqual(metadata[2].parameters, { params: { id: Number } })

            })
        })
    })
})
