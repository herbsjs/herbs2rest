const { herbarium } = require('@herbsjs/herbarium')
const { entity, id, field } = require('@herbsjs/gotu')
const { usecase, step, Ok } = require('@herbsjs/herbs')
const { populateMetadata } = require('../src/populateMetadata.js')
const assert = require('assert').strict

describe.only('populateMetadata', () => {

    // To Do:
    // Cenarios: IDs
    //  sem IDs
    //  com IDs
    //  multiplos IDs
    //  entidades com IDs diferentes do request
    // Sources dos parametros (params, query, body, headers, cookies, path, ip, protocol, secure, xhr)
    // Com Controller geral customizado, não individual

    const anEntity = ({ name }) => {
        const anEntity = entity(`${name}`, {
            id: id(Number),
            name: field(String)
        })
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

    describe('should populate REST metadata for a use case with domain metadata only', () => {
        describe('CRUD info', () => {
            it('CRUD Read', () => {
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
                assert.equal(metadata.verb, 'GET')
                assert.equal(metadata.resource, 'readEntities')
                assert.equal(metadata.path, '/readEntities/:id')
                assert.equal(typeof metadata.controller, 'function')
                assert.deepEqual(metadata.params, { params: { id: Number } })
            })

            it('CRUD Read All', () => {
                // given
                herbarium.reset()
                const operation = herbarium.crud.readAll
                const { entity } = anEntity({ name: `${operation} Entity` })
                const { uc } = anUseCase({ crud: operation, entity })

                // when
                populateMetadata({ herbarium })

                // then
                const usecaseName = `${operation}Usecase`
                metadata = herbarium.usecases.get(usecaseName).REST
                assert.equal(metadata.verb, 'GET')
                assert.equal(metadata.resource, 'readAllEntities')
                assert.equal(metadata.path, '/readAllEntities')
                assert.equal(typeof metadata.controller, 'function')
                assert.deepEqual(metadata.params, { query: { limit: Number, offset: Number } })
            })

            it('CRUD Create', () => {
                // given
                herbarium.reset()
                const operation = herbarium.crud.create
                const { entity } = anEntity({ name: `${operation} Entity` })
                const { uc } = anUseCase({ crud: operation, entity })

                // when
                populateMetadata({ herbarium })

                // then
                const usecaseName = `${operation}Usecase`
                metadata = herbarium.usecases.get(usecaseName).REST
                assert.equal(metadata.verb, 'POST')
                assert.equal(metadata.resource, 'createEntities')
                assert.equal(metadata.path, '/createEntities')
                assert.equal(typeof metadata.controller, 'function')
                assert.deepEqual(metadata.params, { body: { name: String } })
            })

            it('CRUD Update', () => {
                // given
                herbarium.reset()
                const operation = herbarium.crud.update
                const { entity } = anEntity({ name: `${operation} Entity` })
                const { uc } = anUseCase({ crud: operation, entity })

                // when
                populateMetadata({ herbarium })

                // then
                const usecaseName = `${operation}Usecase`
                metadata = herbarium.usecases.get(usecaseName).REST
                assert.equal(metadata.verb, 'PUT')
                assert.equal(metadata.resource, 'updateEntities')
                assert.equal(metadata.path, '/updateEntities/:id')
                assert.equal(typeof metadata.controller, 'function')
                assert.deepEqual(metadata.params, { params: { id: Number }, body: { name: String } })
            })
            it('CRUD Delete', () => {
                // given
                herbarium.reset()
                const operation = herbarium.crud.delete
                const { entity } = anEntity({ name: `${operation} Entity` })
                const { uc } = anUseCase({ crud: operation, entity })

                // when
                populateMetadata({ herbarium })

                // then
                const usecaseName = `${operation}Usecase`
                metadata = herbarium.usecases.get(usecaseName).REST
                assert.equal(metadata.verb, 'DELETE')
                assert.equal(metadata.resource, 'deleteEntities')
                assert.equal(metadata.path, '/deleteEntities/:id')
                assert.equal(typeof metadata.controller, 'function')
                assert.deepEqual(metadata.params, { params: { id: Number } })
            })
        })

        describe('Non-CRUD operations', () => {
            it('CRUD Other', () => {
                // given
                herbarium.reset()
                const operation = herbarium.crud.other
                const { entity } = anEntity({ name: `${operation} Entity` })
                const { uc } = anUseCase({ crud: operation, entity })

                // when
                populateMetadata({ herbarium })

                // then
                const usecaseName = `${operation}Usecase`
                metadata = herbarium.usecases.get(usecaseName).REST
                assert.equal(metadata.verb, 'POST')
                assert.equal(metadata.resource, 'otherEntities')
                assert.equal(metadata.path, '/otherEntities')
                assert.equal(typeof metadata.controller, 'function')
                assert.deepEqual(metadata.params, { body: { id: Number } })
            })

            it('undefined CRUD', () => {
                // given
                herbarium.reset()
                const operation = undefined
                const { entity } = anEntity({ name: `Not Defined Entity` })
                const { uc } = anUseCase({ crud: operation, entity })

                // when
                populateMetadata({ herbarium })

                // then
                const usecaseName = `${operation}Usecase`
                metadata = herbarium.usecases.get(usecaseName).REST
                assert.equal(metadata.verb, 'POST')
                assert.equal(metadata.resource, 'notDefinedEntities')
                assert.equal(metadata.path, '/notDefinedEntities')
                assert.equal(typeof metadata.controller, 'function')
                assert.deepEqual(metadata.params, { body: { id: Number } })
            })
        })
        describe('Resource Name', () => {
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
                assert.throws(() => {
                    populateMetadata({ herbarium })
                }, /^Error: It is not possible to generate a REST resource name for usecase ReadUsecase. Please, add a group or entity to the usecase metadata.$/)

            })
        })
        describe('Params Types', () => {
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
                assert.deepEqual(metadata.params, {
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

    describe('should populate metadata for a use case with overridden of metadata', () => {
        describe('overridden REST metadata', () => {
            describe('resource', () => {
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
                    assert.equal(metadata.verb, 'GET')
                    assert.equal(metadata.resource, 'overriddenResource')
                    assert.equal(metadata.path, '/overriddenResource/:id')
                    assert.equal(typeof metadata.controller, 'function')
                    assert.deepEqual(metadata.params, { params: { id: Number } })
                })
            })
            describe('verb', () => {
                it('with verb', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity` })
                    const { uc } = anUseCase({ crud: operation, entity })
                    const usecaseName = `${operation}Usecase`
                    herbarium.usecases.get(usecaseName).metadata({ REST: { verb: 'POST' } })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const metadata = herbarium.usecases.get(usecaseName).REST
                    assert.equal(metadata.verb, 'POST')
                    assert.equal(metadata.resource, 'readEntities')
                    assert.equal(metadata.path, '/readEntities/:id')
                    assert.equal(typeof metadata.controller, 'function')
                    assert.deepEqual(metadata.params, { body: { id: Number } })
                })
            })
            describe('path', () => {
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
                    assert.equal(metadata.verb, 'GET')
                    assert.equal(metadata.resource, 'readEntities')
                    assert.equal(metadata.path, '/overriddenPath')
                    assert.equal(typeof metadata.controller, 'function')
                    assert.deepEqual(metadata.params, { params: { id: Number } })
                })
            })
            describe('controller', () => {
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
                    assert.equal(metadata.verb, 'GET')
                    assert.equal(metadata.resource, 'readEntities')
                    assert.equal(metadata.path, '/readEntities/:id')
                    assert.equal(metadata.controller(), 1)
                    assert.deepEqual(metadata.params, { params: { id: Number } })
                })
            })
            describe('all the metadata overridden', () => {
                it('with all the metadata', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity` })
                    const { uc } = anUseCase({ crud: operation, entity })
                    const usecaseName = `${operation}Usecase`
                    herbarium.usecases.get(usecaseName).metadata({
                        REST: {
                            verb: 'POST',
                            path: '/overriddenPath',
                            resource: 'overriddenResource',
                            params: { cookie: { id1: Number } },
                            controller: (usecase, req, user, res, next, methodName) => 1
                        }
                    })

                    // when
                    populateMetadata({ herbarium })

                    // then
                    const metadata = herbarium.usecases.get(usecaseName).REST
                    assert.equal(metadata.verb, 'POST')
                    assert.equal(metadata.resource, 'overriddenResource')
                    assert.equal(metadata.path, '/overriddenPath')
                    assert.equal(metadata.controller(), 1)
                    assert.deepEqual(metadata.params, { cookie: { id1: Number } })
                })
            })
        })
    })
})
