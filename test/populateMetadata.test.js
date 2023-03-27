const { herbarium } = require('@herbsjs/herbarium')
const { entity, id, field } = require('@herbsjs/gotu')
const { usecase, step, Ok } = require('@herbsjs/herbs')
const { populateMetadata, convention } = require('../src/populateMetadata.js')
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
            const appDefaultController = (usecase, req, user, res, next, methodName) => 2
            const { entity } = anEntity({ name: 'Entity' })
            const { uc1 } = anUseCase({ crud: herbarium.crud.read, entity })
            const { uc2 } = anUseCase({ crud: herbarium.crud.update, entity })

            // when
            populateMetadata({ herbarium, controller: appDefaultController })

            // then
            const metadata1 = herbarium.usecases.get('ReadUsecase').REST
            assert.deepStrictEqual(metadata1.controller(), 2)
            const metadata2 = herbarium.usecases.get('UpdateUsecase').REST
            assert.deepStrictEqual(metadata2.controller(), 2)
        })
    })

    describe('should accept a alternative convention', () => {
        it('should return the correct metadata respecting the new convention', () => {
            // given
            herbarium.reset()
            const { entity } = anEntity({ name: 'Entity' })
            const { uc } = anUseCase({ crud: herbarium.crud.read, entity })

            // clone the default convention and change the toPlural method
            const newConvention = Object.assign({}, convention)
            newConvention.toPlural = (name) => name.toLowerCase() + ' plural'

            // when
            populateMetadata({ herbarium, convention: newConvention })

            // then
            const metadata = herbarium.usecases.get('ReadUsecase').REST
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
                    const { uc } = anUseCase({ crud: operation, entity })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const usecaseName = `${operation}Usecase`
                    const metadata = herbarium.usecases.get(usecaseName).REST
                    assert.equal(metadata.method, method)
                    assert.equal(metadata.resource, resource)
                    assert.equal(metadata.path, path)
                    assert.equal(typeof metadata.controller, 'function')
                    assert.deepEqual(metadata.parameters, parameters)
                    assert.deepEqual(metadata.parametersHandler(req, parameters), resultReq)
                    assert.equal(metadata.userHandler({ user: 'bob' }), 'bob')
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
                    const { uc } = anUseCase({ crud: operation, entity })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const usecaseName = `${operation}Usecase`
                    metadata = herbarium.usecases.get(usecaseName).REST

                    assert.equal(metadata.method, method)
                    assert.equal(metadata.resource, resource)
                    assert.equal(metadata.path, path)
                    assert.equal(typeof metadata.controller, 'function')
                    assert.deepEqual(metadata.parameters, parameters)
                    assert.deepEqual(metadata.parametersHandler(req, parameters), resultReq)
                    assert.equal(metadata.userHandler({ user: 'bob' }), 'bob')
                })
            })
        })

        describe('Resource Name Conventio - Entity Name and Group', () => {
            it('with entity and group', () => {
                // given
                herbarium.reset()
                const operation = herbarium.crud.read
                const { entity } = anEntity({ name: `${operation} Entity` })
                const { uc } = anUseCase({ crud: operation, entity })

                // when
                populateMetadata({ herbarium })

                // then
                const usecaseName = `${operation}Usecase`
                metadata = herbarium.usecases.get(usecaseName).REST
                assert.equal(metadata.resource, 'readEntities')
            })
            it('with entity and no group', () => {
                // given
                herbarium.reset()
                const operation = herbarium.crud.read
                const { entity } = anEntity({ name: `${operation} Entity` })
                const { uc } = anUseCase({ crud: operation, entity, group: undefined })

                // when
                populateMetadata({ herbarium })

                // then
                const usecaseName = `${operation}Usecase`
                metadata = herbarium.usecases.get(usecaseName).REST
                assert.equal(metadata.resource, 'readEntities')
            })
            it('with no entity and group', () => {
                // given
                herbarium.reset()
                const operation = herbarium.crud.read
                const { entity } = anEntity({ name: `${operation} Entity` })
                const { uc } = anUseCase({ crud: operation, entity: undefined, group: 'The Group' })

                // when
                populateMetadata({ herbarium })

                // then
                const usecaseName = `${operation}Usecase`
                metadata = herbarium.usecases.get(usecaseName).REST
                assert.equal(metadata.resource, 'theGroups')
            })
            it('with no entity and no group', () => {
                // given
                herbarium.reset()
                const operation = herbarium.crud.read
                const { uc } = anUseCase({ crud: operation, entity: undefined, group: null })

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
                    const { uc } = anUseCase({ crud: operation, entity, request })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const usecaseName = `${operation}Usecase`
                    metadata = herbarium.usecases.get(usecaseName).REST
                    assert.deepEqual(metadata.parameters, { params: { idName: Number }, query: { name: String } })
                    assert.equal(metadata.path, '/readEntities/:idName')
                })

                it('with an entity with no ID', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity`, fields: { name: field(String) } })
                    const request = { id: Number, name: String }
                    const { uc } = anUseCase({ crud: operation, entity, request })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const usecaseName = `${operation}Usecase`
                    metadata = herbarium.usecases.get(usecaseName).REST
                    assert.deepEqual(metadata.parameters, { query: { id: Number, name: String } })
                    assert.equal(metadata.path, '/readEntities')
                })

                it('with an entity with multiple IDs', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity`, fields: { id1: id(Number), id2: id(Number), name: field(String) } })
                    const request = { id1: Number, id2: Number, name: String }
                    const { uc } = anUseCase({ crud: operation, entity, request })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const usecaseName = `${operation}Usecase`
                    metadata = herbarium.usecases.get(usecaseName).REST
                    assert.deepEqual(metadata.parameters, { params: { id1: Number, id2: Number }, query: { name: String } })
                    assert.equal(metadata.path, '/readEntities/:id1/:id2')
                })

                it('with an entity with multiple IDs but with partial intersection with use case request', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity`, fields: { id1: id(Number), id2: id(Number), name: field(String) } })
                    const request = { id1: Number, id3: Number, name: String }
                    const { uc } = anUseCase({ crud: operation, entity, request })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const usecaseName = `${operation}Usecase`
                    metadata = herbarium.usecases.get(usecaseName).REST
                    assert.deepEqual(metadata.parameters, { params: { id1: Number }, query: { id3: Number, name: String } })
                    assert.equal(metadata.path, '/readEntities/:id1')
                })


            })
            describe('Types', () => {
                it('with all the types', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity` })
                    const request = {
                        id: Number,
                        name: String,
                        age: Number,
                        date: Date,
                        bool: Boolean,
                        array: Array,
                        object: Object,
                    }
                    const { uc } = anUseCase({ crud: operation, entity, request })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const usecaseName = `${operation}Usecase`
                    metadata = herbarium.usecases.get(usecaseName).REST
                    assert.deepEqual(metadata.parameters, {
                        params: {
                            id: Number,
                        },
                        query: {
                            name: String,
                            age: Number,
                            date: Date,
                            bool: Boolean,
                            array: Array,
                            object: Object,
                        }
                    })
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
                    const { uc } = anUseCase({ crud: operation, entity })
                    const usecaseName = `${operation}Usecase`
                    herbarium.usecases.get(usecaseName).metadata({ REST: { resource: 'overriddenResource' } })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const metadata = herbarium.usecases.get(usecaseName).REST
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
                    const { uc } = anUseCase({ crud: operation, entity })
                    const usecaseName = `${operation}Usecase`
                    herbarium.usecases.get(usecaseName).metadata({ REST: { method: 'POST' } })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const metadata = herbarium.usecases.get(usecaseName).REST
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
                    const { uc } = anUseCase({ crud: operation, entity })
                    const usecaseName = `${operation}Usecase`
                    herbarium.usecases.get(usecaseName).metadata({ REST: { method: 'INVALID' } })

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
                    const { uc } = anUseCase({ crud: operation, entity })
                    const usecaseName = `${operation}Usecase`
                    herbarium.usecases.get(usecaseName).metadata({ REST: { path: '/overriddenPath' } })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const metadata = herbarium.usecases.get(usecaseName).REST
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
                    const { uc } = anUseCase({ crud: operation, entity })
                    const usecaseName = `${operation}Usecase`
                    herbarium.usecases.get(usecaseName).metadata({ REST: { controller: (usecase, req, user, res, next, methodName) => 1 } })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const metadata = herbarium.usecases.get(usecaseName).REST
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
                    const { uc } = anUseCase({ crud: operation, entity })
                    const usecaseName = `${operation}Usecase`
                    herbarium.usecases.get(usecaseName).metadata({ REST: { parameters: { query: { id1: Number } } } })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const metadata = herbarium.usecases.get(usecaseName).REST
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
                    const { uc } = anUseCase({ crud: operation, entity })
                    const usecaseName = `${operation}Usecase`
                    herbarium.usecases.get(usecaseName).metadata({
                        REST: {
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
                        }
                    })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const metadata = herbarium.usecases.get(usecaseName).REST
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
                    const { uc } = anUseCase({ crud: operation, entity })
                    const usecaseName = `${operation}Usecase`
                    herbarium.usecases.get(usecaseName).metadata({ REST: { parametersHandler: (req, res, next) => 1 } })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const metadata = herbarium.usecases.get(usecaseName).REST
                    assert.equal(metadata.method, 'GET')
                    assert.equal(metadata.resource, 'readEntities')
                    assert.equal(metadata.path, '/readEntities/:id')
                    assert.equal(typeof metadata.controller, 'function')
                    assert.deepEqual(metadata.parameters, { params: { id: Number } })
                    assert.equal(metadata.parametersHandler(), 1)
                })
            })
            describe('User Handler', () => { 
                it('with user handler', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity` })
                    const { uc } = anUseCase({ crud: operation, entity })
                    const usecaseName = `${operation}Usecase`
                    herbarium.usecases.get(usecaseName).metadata({ REST: { userHandler: (request) => 'Jane' } })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const metadata = herbarium.usecases.get(usecaseName).REST
                    assert.equal(metadata.method, 'GET')
                    assert.equal(metadata.resource, 'readEntities')
                    assert.equal(metadata.path, '/readEntities/:id')
                    assert.equal(typeof metadata.controller, 'function')
                    assert.deepEqual(metadata.parameters, { params: { id: Number } })
                    assert.equal(metadata.userHandler(),  'Jane')
                })
            })

            describe('All the metadata overridden', () => {
                it('with all the metadata', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity` })
                    const { uc } = anUseCase({ crud: operation, entity })
                    const usecaseName = `${operation}Usecase`
                    herbarium.usecases.get(usecaseName).metadata({
                        REST: {
                            method: 'POST',
                            path: '/overriddenPath',
                            resource: 'overriddenResource',
                            parameters: { cookie: { id1: Number } },
                            parametersHandler: (req, res, next) => 1,
                            controller: (usecase, req, user, res, next, methodName) => 1
                        }
                    })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const metadata = herbarium.usecases.get(usecaseName).REST
                    assert.equal(metadata.method, 'POST')
                    assert.equal(metadata.resource, 'overriddenResource')
                    assert.equal(metadata.path, '/overriddenPath')
                    assert.equal(metadata.controller(), 1)
                    assert.deepEqual(metadata.parameters, { cookie: { id1: Number } })
                    assert.equal(metadata.parametersHandler(), 1)
                })
            })
        })
    })
})
