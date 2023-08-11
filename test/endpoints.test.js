const { herbarium } = require('@herbsjs/herbarium')
const { entity, id, field } = require('@herbsjs/herbs')
const { usecase, step, Ok } = require('@herbsjs/herbs')
const { endpoints } = require('../src/endpoints')
const assert = require('assert').strict
const { Resource } = require('../src/builders/resource')
const { Path } = require('../src/builders/path')
const { HTTPMethod } = require('../src/builders/httpMethod')
const { Parameter } = require('../src/builders/parameter')

const anEntity = ({ name, fields }) => {
    if (!name) return { entity: undefined }
    const defaultFields = { id: id(Number), name: field(String), aFunction() { } }
    fields = fields || defaultFields
    const anEntity = entity(`${name}`, fields)
    herbarium.nodes.add(name, anEntity, herbarium.node.entity)
    return { entity: anEntity }
}

const anUseCase = ({ crud, entity, request }) => {

    const crud2request = {
        [herbarium.crud.read]: { id: Number },
        [herbarium.crud.readAll]: { limit: Number, offset: Number },
        [herbarium.crud.create]: { name: String },
        [herbarium.crud.update]: { id: Number, name: String },
        [herbarium.crud.delete]: { id: Number }
    }

    request = request || crud2request[crud] || { id: Number }
    const name = crud ? crud : 'Just A'
    const anUC = () => usecase(`${name} Usecase`, {
        request,
        authorize: async _ => Ok(),
        'A Step': step(_ => Ok())
    })

    const node = herbarium.nodes.add(`${name}Usecase`, anUC, herbarium.node.usecase)
    if (entity) node.link(entity.name)
    if (crud) node.metadata({ operation: crud })

    return { anUC }
}

describe('endpoints', () => {

    describe('missing parameters', () => {
        it('should not create endpoints', () => {
            // given
            herbarium.reset()
            const { entity } = anEntity({ name: 'Entity Name' })
            anUseCase({ crud: herbarium.crud.read, entity })

            // when
            function noHerbarium() {
                endpoints({}, {
                    '': (endpoints) => endpoints.build(),
                })
            }

            // then
            assert.throws(() => noHerbarium(), /^Error: Herbarium is required$/)
        })
    })

    describe('usecases with no endpoints defined (defaults)', () => {
        describe('usecases', () => {
            const CrudCases = [
                {
                    entityName: 'Read Entity',
                    operation: herbarium.crud.read,
                    asserts: {
                        method: 'GET',
                        resource: 'readEntities',
                        path: '/readEntities/:id',
                        parameters: { params: { id: Number } },
                        req: { params: { id: 1 } },
                        resultReq: { id: 1 }
                    }
                },
                {
                    entityName: 'Read All Entity',
                    operation: herbarium.crud.readAll,
                    asserts: {
                        method: 'GET',
                        resource: 'readAllEntities',
                        path: '/readAllEntities',
                        parameters: { query: { limit: Number, offset: Number } },
                        req: { query: { limit: 10, offset: 0 } },
                        resultReq: { limit: 10, offset: 0 }
                    }
                },
                {
                    entityName: 'Create Entity',
                    operation: herbarium.crud.create,
                    asserts: {
                        method: 'POST',
                        resource: 'createEntities',
                        path: '/createEntities',
                        parameters: { body: { name: String } },
                        req: { body: { name: 'Jane' } },
                        resultReq: { name: 'Jane' }
                    }
                },
                {
                    entityName: 'Update Entity',
                    operation: herbarium.crud.update,
                    asserts: {
                        method: 'PUT',
                        resource: 'updateEntities',
                        path: '/updateEntities/:id',
                        parameters: { params: { id: Number }, body: { name: String } },
                        req: { params: { id: 1 }, body: { name: 'Jane' } },
                        resultReq: { id: 1, name: 'Jane' }
                    }
                },
                {
                    entityName: 'Delete Entity',
                    operation: herbarium.crud.delete,
                    asserts: {
                        method: 'DELETE',
                        resource: 'deleteEntities',
                        path: '/deleteEntities/:id',
                        parameters: { params: { id: Number } },
                        req: { params: { id: 1 } },
                        resultReq: { id: 1 }
                    }
                },
            ]

            const NonCrudCases = [
                {
                    operation: herbarium.crud.other,
                    entityName: 'Other Entity',
                    asserts: {
                        method: 'POST',
                        resource: 'otherEntities',
                        path: '/otherEntities',
                        parameters: { body: { id: Number } },
                        req: { body: { id: 1 } },
                        resultReq: { id: 1 }
                    }
                },
                {
                    asserts: {
                        method: 'POST',
                        resource: 'justAUsecases',
                        path: '/justAUsecases',
                        parameters: { body: { id: Number } },
                        req: { body: { id: 1 } },
                        resultReq: { id: 1 }
                    }
                }
            ]

            const testCases = [].concat(CrudCases, NonCrudCases)
            testCases.forEach(({ entityName, operation, asserts }) => {
                it(`should initialize endpoint for ${entityName}`, () => {
                    // given
                    herbarium.reset()
                    const { entity } = anEntity({ name: entityName })
                    const { anUC } = anUseCase({ crud: operation, entity })
                    const controller = () => 1
                    const authorizationHandler = () => 2
                    // when
                    endpoints({ herbarium, controller, authorizationHandler }, {
                        '': (endpoints) => endpoints.build(),
                    })

                    // then
                    const endpoint = herbarium.nodes.find({ type: endpoints.NodeType })[0]
                    assert.equal(endpoint.value.version, '')
                    assert.equal(endpoint.value.method, asserts.method)
                    assert.equal(endpoint.value.resource, asserts.resource)
                    assert.equal(endpoint.value.path, asserts.path)
                    assert.deepEqual(endpoint.value.parameters, asserts.parameters)
                    assert.deepEqual(endpoint.value.parametersHandler(anUC, asserts.req, asserts.parameters), asserts.resultReq)
                    assert.equal(endpoint.value.controller(), 1)
                    assert.equal(endpoint.value.authorizationHandler(), 2)

                })
            })
        })

        describe('resource name', () => {
            describe('crud usecase is linked to an entity', () => {
                it('should use the entity name for the resource name', () => {
                    // given
                    herbarium.reset()
                    const { entity } = anEntity({ name: 'Entity Name' })
                    const { anUC } = anUseCase({ crud: herbarium.crud.read, entity })

                    // when
                    endpoints({ herbarium }, {
                        '': (endpoints) => endpoints.build(),
                    })

                    // then
                    const endpoint = herbarium.nodes.find({ type: endpoints.NodeType })[0]
                    assert.equal(endpoint.value.resource, 'entityNames')
                })
            })
            describe('crud usecase is not linked to an entity', () => {
                it('should use the usecase name for the resource name', () => {
                    // given
                    herbarium.reset()
                    const { anUC } = anUseCase({ crud: herbarium.crud.read })

                    // when
                    endpoints({ herbarium }, {
                        '': (endpoints) => endpoints.build(),
                    })

                    // then
                    const endpoint = herbarium.nodes.find({ type: endpoints.NodeType })[0]
                    assert.equal(endpoint.value.resource, 'readUsecases')
                })
            })
            describe('non crud usecase is linked to an entity', () => {
                it('should use the entity name for the resource name', () => {
                    // given
                    herbarium.reset()
                    const { entity } = anEntity({ name: 'Entity Name' })
                    const { anUC } = anUseCase({ crud: undefined, entity })

                    // when
                    endpoints({ herbarium }, {
                        '': (endpoints) => endpoints.build(),
                    })

                    // then
                    const endpoint = herbarium.nodes.find({ type: endpoints.NodeType })[0]
                    assert.equal(endpoint.value.resource, 'entityNames')
                })
            })
            describe('non crud usecase is not linked to an entity', () => {
                it('should use the usecase name for the resource name', () => {
                    // given
                    herbarium.reset()
                    const { anUC } = anUseCase({ crud: undefined })

                    // when
                    endpoints({ herbarium }, {
                        '': (endpoints) => endpoints.build(),
                    })

                    // then
                    const endpoint = herbarium.nodes.find({ type: endpoints.NodeType })[0]
                    assert.equal(endpoint.value.resource, 'justAUsecases')
                })
            })
        })

        describe('parameters', () => {
            describe('IDs', () => {
                describe('the IDs from entity matchs the IDs from usecase', () => {
                    it('should use the IDs from entity', () => {
                        // given
                        herbarium.reset()
                        const operation = herbarium.crud.read
                        const { entity } = anEntity({ name: `${operation} Entity`, fields: { idName: id(Number), idName2: id(Number), name: field(String) } })
                        const request = { idName: Number, idName2: Number, name: String }
                        anUseCase({ crud: operation, entity, request })

                        // when
                        endpoints({ herbarium }, {
                            '': (endpoints) => endpoints.build(),
                        })

                        // then
                        const endpoint = herbarium.nodes.find({ type: endpoints.NodeType })[0]
                        assert.deepEqual(endpoint.value.parameters, { params: { idName: Number, idName2: Number }, query: { name: String } })
                        assert.equal(endpoint.value.path, '/readEntities/:idName/:idName2')

                    })
                })

                describe('entity with no ID', () => {
                    it('should use only the request info', () => {
                        // given
                        herbarium.reset()
                        const operation = herbarium.crud.read
                        const { entity } = anEntity({ name: `${operation} Entity`, fields: { name: field(String) } })
                        const request = { id: Number, name: String }
                        anUseCase({ crud: operation, entity, request })

                        // when
                        endpoints({ herbarium }, {
                            '': (endpoints) => endpoints.build(),
                        })

                        // then
                        const endpoint = herbarium.nodes.find({ type: endpoints.NodeType })[0]
                        assert.deepEqual(endpoint.value.parameters, { query: { id: Number, name: String } })
                        assert.equal(endpoint.value.path, '/readEntities')
                    })
                })

                describe('entity with multiple IDs but with partial intersection with use case request', () => {
                    it('should use only IDs that matchs the use case request', () => {
                        // given
                        herbarium.reset()
                        const operation = herbarium.crud.read
                        const { entity } = anEntity({ name: `${operation} Entity`, fields: { id1: id(Number), id2: id(Number), name: field(String) } })
                        const request = { id1: Number, id3: Number, name: String }
                        anUseCase({ crud: operation, entity, request })

                        // when
                        endpoints({ herbarium }, {
                            '': (endpoints) => endpoints.build(),
                        })

                        // then
                        const endpoint = herbarium.nodes.find({ type: endpoints.NodeType })[0]
                        assert.deepEqual(endpoint.value.parameters, { params: { id1: Number }, query: { id3: Number, name: String } })
                        assert.equal(endpoint.value.path, '/readEntities/:id1')
                    })
                })
            })

            describe('Types', () => {
                describe('all native types', () => {
                    it('should use the native types', () => {
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
                                hobbies: field(Array),
                                aFunction() { }
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
                        endpoints({ herbarium }, {
                            '': (endpoints) => endpoints.build(),
                        })

                        // then
                        const endpoint = herbarium.nodes.find({ type: endpoints.NodeType })[0]
                        assert.deepEqual(endpoint.value.parameters, { params: { id: Number }, query: { name: String, age: Number, isAdult: Boolean, birthDate: Date, address: Object, hobbies: Array } })
                        assert.equal(endpoint.value.path, '/readEntities/:id')
                    })
                })
                describe('all native types as arrays', () => {
                    it('should use the native types as arrays', () => {
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
                                hobbies: field([Array]),
                                aFunction() { }
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
                        endpoints({ herbarium }, {
                            '': (endpoints) => endpoints.build(),
                        })

                        // then
                        const endpoint = herbarium.nodes.find({ type: endpoints.NodeType })[0]
                        assert.deepEqual(endpoint.value.parameters, { params: { id: [Number] }, query: { name: [String], age: [Number], isAdult: [Boolean], birthDate: [Date], address: [Object], hobbies: [Array] } })
                        assert.equal(endpoint.value.path, '/readEntities/:id')
                    })
                })
                describe('entity on request', () => {
                    it('should use nested parameters', () => {
                        // given
                        herbarium.reset()
                        const operation = herbarium.crud.read
                        const { entity } = anEntity({
                            name: `${operation} Entity`, fields: {
                                id: id(Number),
                                name: field(String),
                                aFunction() { }
                            }
                        })
                        const { entity: Customer } = anEntity({
                            name: `Customer`, fields: {
                                id: id(Number),
                                description: field(String),
                                age: field(Number),
                                aFunction() { }
                            }
                        })
                        const { entity: Order } = anEntity({
                            name: `Order`, fields: {
                                id1: id(Number),
                                id2: id(Number),
                                amount: field(Number),
                                aFunction() { }
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
                        endpoints({ herbarium }, {
                            '': (endpoints) => endpoints.build(),
                        })

                        // then
                        const endpoint = herbarium.nodes.find({ type: endpoints.NodeType })[0]
                        assert.deepEqual(endpoint.value.parameters, {
                            params: { id: Number }, query: {
                                name: String,
                                customer: { id: Number },
                                customers: [{ id: Number }],
                                order: { id1: Number, id2: Number },
                                orders: [{ id1: Number, id2: Number }]
                            }
                        })
                        assert.equal(endpoint.value.path, '/readEntities/:id')

                    })
                })
            })
        })

        describe('version', () => {
            describe('with version for all endpoints', () => {
                it('should use the version for all endpoints', () => {
                    // given
                    herbarium.reset()
                    const { entity } = anEntity({ name: 'Entity Name' })
                    const { anUC } = anUseCase({ crud: herbarium.crud.read, entity })

                    // when
                    endpoints({ herbarium }, {
                        '': (endpoints) => endpoints.build(),
                        'v1': (endpoints) => endpoints.build(),
                        'v2': (endpoints) => endpoints.build()
                    })

                    // then
                    const endpoint = herbarium.nodes.find({ type: endpoints.NodeType })
                    assert.equal(endpoint.length, 3)
                    assert.equal(endpoint[0].value.version, '')
                    assert.equal(endpoint[0].value.path, '/entityNames/:id')
                    assert.equal(endpoint[1].value.version, 'v1')
                    assert.equal(endpoint[1].value.path, '/v1/entityNames/:id')
                    assert.equal(endpoint[2].value.version, 'v2')
                    assert.equal(endpoint[2].value.path, '/v2/entityNames/:id')

                })
            })
        })
    })

    describe('usecases with endpoints defined (custom)', () => {

        describe('explicitely disabled', () => {
            it('should not create endpoints', () => {
                // given
                herbarium.reset()
                const { entity } = anEntity({ name: 'Entity Name' })
                anUseCase({ crud: herbarium.crud.read, entity })
                anUseCase({ crud: herbarium.crud.update, entity })

                // when
                endpoints({ herbarium }, {
                    '': (endpoints) => {
                        endpoints.ignore('ReadUsecase')
                        endpoints.build()
                    },
                    'v1': (endpoints) => {
                        endpoints.ignore('UpdateUsecase')
                        endpoints.build()
                    }
                })

                // then
                const endpoint = herbarium.nodes.find({ type: endpoints.NodeType })
                assert.equal(endpoint.length, 2)
                assert.equal(endpoint[0].value.method, 'PUT')
                assert.equal(endpoint[0].value.version, '')
                assert.equal(endpoint[1].value.method, 'GET')
                assert.equal(endpoint[1].value.version, 'v1')

            })
        })

        describe('override controller and authorizationHandler', () => {
            describe('with controller', () => {
                it('should use the controller', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity` })
                    anUseCase({ crud: operation, entity })
                    const controller = () => 1
                    
                    // when
                    endpoints({ herbarium, controller }, {
                        '': (endpoints) => {
                            endpoints.for('ReadUsecase').use({ resource: 'myResource' })
                            endpoints.build()
                        }
                    })

                    // then
                    const endpointCheck = herbarium.nodes.find({ type: endpoints.NodeType })[0]
                    assert.equal(endpointCheck.value.resource, 'myResource')
                    assert.equal(endpointCheck.value.path, '/myResource/:id')
                    assert.equal(endpointCheck.value.controller(), 1)
                })
            })
            describe('with authorizationHandler', () => {
                it('should use the authorizationHandler', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity` })
                    anUseCase({ crud: operation, entity })
                    const authorizationHandler = () => 1
                    
                    // when
                    endpoints({ herbarium, authorizationHandler }, {
                        '': (endpoints) => {
                            endpoints.for('ReadUsecase').use({ resource: 'myResource' })
                            endpoints.build()
                        }
                    })

                    // then
                    const endpointCheck = herbarium.nodes.find({ type: endpoints.NodeType })[0]
                    assert.equal(endpointCheck.value.resource, 'myResource')
                    assert.equal(endpointCheck.value.path, '/myResource/:id')
                    assert.equal(endpointCheck.value.authorizationHandler(), 1)
                })
            })
        })

        describe('resource', () => {
            describe('with resource', () => {
                it('should use the resource', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity` })
                    anUseCase({ crud: operation, entity })

                    // when
                    endpoints({ herbarium }, {
                        '': (endpoints) => {
                            endpoints.for('ReadUsecase').use({ resource: 'myResource' })
                            endpoints.build()
                        }
                    })

                    // then
                    const endpointCheck = herbarium.nodes.find({ type: endpoints.NodeType })[0]
                    assert.equal(endpointCheck.value.resource, 'myResource')
                    assert.equal(endpointCheck.value.path, '/myResource/:id')
                })
            })
        })

        describe('method', () => {
            describe('with method', () => {
                it('should use the method', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity` })
                    anUseCase({ crud: operation, entity })

                    // when
                    endpoints({ herbarium }, {
                        '': (endpoints) => {
                            endpoints.for('ReadUsecase').use({ method: 'POST' })
                            endpoints.build()
                        }
                    })

                    // then
                    const endpointCheck = herbarium.nodes.find({ type: endpoints.NodeType })[0]
                    assert.equal(endpointCheck.value.method, 'POST')
                    assert.equal(endpointCheck.value.path, '/readEntities')
                })
            })
            describe('invalid method', () => {
                it('should throw an error', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity` })
                    anUseCase({ crud: operation, entity })

                    // when
                    function addInvalidMethod() {
                        endpoints({ herbarium }, {
                            '': (endpoints) => {
                                endpoints.for('ReadUsecase').use({ method: 'INVALID' })
                                endpoints.build()
                            }
                        })
                    }

                    // when
                    // then
                    assert.throws(() => addInvalidMethod(), /^Error: Invalid HTTP method: INVALID$/)
                })
            })
        })

        describe('path', () => {
            describe('with path', () => {
                it('should use the path', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity` })
                    anUseCase({ crud: operation, entity })

                    // when
                    endpoints({ herbarium }, {
                        '': (endpoints) => {
                            endpoints.for('ReadUsecase').use({ path: '/overriddenPath' })
                            endpoints.build()
                        }
                    })

                    // then
                    const endpointCheck = herbarium.nodes.find({ type: endpoints.NodeType })[0]
                    assert.equal(endpointCheck.value.path, '/overriddenPath')
                })
            })
        })

        describe('controller', () => {
            describe('with controller', () => {
                it('should use the controller', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity` })
                    anUseCase({ crud: operation, entity })

                    // when
                    endpoints({ herbarium }, {
                        '': (endpoints) => {
                            endpoints.for('ReadUsecase').use({ controller: () => 1 })
                            endpoints.build()
                        }
                    })

                    // then
                    const endpointCheck = herbarium.nodes.find({ type: endpoints.NodeType })[0]
                    assert.equal(endpointCheck.value.controller(), 1)
                })
            })
        })

        describe('parameters', () => {
            describe('with parameters', () => {
                it('should use the parameters', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity` })
                    anUseCase({ crud: operation, entity })

                    // when
                    endpoints({ herbarium }, {
                        '': (endpoints) => {
                            endpoints.for('ReadUsecase').use({ parameters: { query: { id1: Number } } })
                            endpoints.build()
                        }
                    })

                    // then
                    const endpointCheck = herbarium.nodes.find({ type: endpoints.NodeType })[0]
                    assert.deepEqual(endpointCheck.value.parameters, { query: { id1: Number } })
                    assert.equal(endpointCheck.value.path, '/readEntities')
                })
            })
            describe('with parameters from different sources', () => {
                it('should use the parameters from different sources', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity` })
                    anUseCase({ crud: operation, entity })

                    // when
                    endpoints({ herbarium }, {
                        '': (endpoints) => {
                            endpoints.for('ReadUsecase').use({
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
                            })
                            endpoints.build()
                        }
                    })

                    // then
                    const endpointCheck = herbarium.nodes.find({ type: endpoints.NodeType })[0]
                    assert.deepEqual(endpointCheck.value.parameters, {
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
        })

        describe('parameters handler', () => {
            describe('with parameters handler', () => {
                it('should use the parameters handler', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity` })
                    anUseCase({ crud: operation, entity })

                    // when
                    endpoints({ herbarium }, {
                        '': (endpoints) => {
                            endpoints.for('ReadUsecase').use({ parametersHandler: () => 1 })
                            endpoints.build()
                        }
                    })

                    // then
                    const endpointCheck = herbarium.nodes.find({ type: endpoints.NodeType })[0]
                    assert.equal(endpointCheck.value.parametersHandler(), 1)

                })
            })
        })

        describe('authorization handler', () => {
            describe('with authorization handler', () => {
                it('should use the authorization handler', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity` })
                    anUseCase({ crud: operation, entity })

                    // when
                    endpoints({ herbarium }, {
                        '': (endpoints) => {
                            endpoints.for('ReadUsecase').use({ authorizationHandler: () => 1 })
                            endpoints.build()
                        }
                    })

                    // then
                    const endpointCheck = herbarium.nodes.find({ type: endpoints.NodeType })[0]
                    assert.equal(endpointCheck.value.authorizationHandler(), 1)
                })
            })
        })

        describe('version', () => {
            describe('with version', () => {
                it('should use the version', () => {
                    // given
                    herbarium.reset()
                    const operation = herbarium.crud.read
                    const { entity } = anEntity({ name: `${operation} Entity` })
                    anUseCase({ crud: operation, entity })

                    // when
                    endpoints({ herbarium }, {
                        'v1': (endpoints) => {
                            endpoints.for('ReadUsecase').use({ method: 'POST' })
                            endpoints.build()
                        }
                    })

                    // then
                    const endpointCheck = herbarium.nodes.find({ type: endpoints.NodeType })[0]
                    assert.equal(endpointCheck.value.version, 'v1')
                    assert.equal(endpointCheck.value.method, 'POST')
                })
            })
        })

    })

    describe('multiple endpoints for the same usecase', () => {
        describe('multiple endpoints', () => {
            it('should create multiple endpoints', () => {
                // given
                herbarium.reset()
                const operation = herbarium.crud.read
                const { entity } = anEntity({ name: `${operation} Entity` })
                anUseCase({ crud: operation, entity })

                // when
                endpoints({ herbarium }, {
                    '': (endpoints) => {
                        endpoints.for('ReadUsecase').use({ method: 'POST', resource: 'myResource' })
                        endpoints.for('ReadUsecase', 'ReadUsecaseEndpoint2').use({ method: 'GET', path: '/overriddenPath' })
                        endpoints.build()
                    }
                })

                // then
                const endpointCheck = herbarium.nodes.find({ type: endpoints.NodeType })
                assert.equal(endpointCheck[0].value.method, 'POST')
                assert.equal(endpointCheck[1].value.method, 'GET')
                assert.equal(endpointCheck[0].value.resource, 'myResource')
                assert.equal(endpointCheck[1].value.resource, 'readEntities')
                assert.equal(endpointCheck[0].value.path, '/myResource')
                assert.equal(endpointCheck[1].value.path, '/overriddenPath')
            })
        })

        describe('multiple versions', () => {
            it('should use the version', () => {
                // given
                herbarium.reset()
                const operation = herbarium.crud.read
                const { entity } = anEntity({ name: `${operation} Entity` })
                anUseCase({ crud: operation, entity })

                // when
                endpoints({ herbarium }, {
                    'v1': (endpoints) => {
                        endpoints.for('ReadUsecase').use({ method: 'POST' })
                        endpoints.build()
                    },
                    'v2': (endpoints) => {
                        endpoints.for('ReadUsecase').use({ method: 'GET' })
                        endpoints.build()
                    }
                })

                // then
                const endpointCheck = herbarium.nodes.find({ type: endpoints.NodeType })
                assert.equal(endpointCheck[0].value.version, 'v1')
                assert.equal(endpointCheck[0].value.method, 'POST')
                assert.equal(endpointCheck[1].value.version, 'v2')
                assert.equal(endpointCheck[1].value.method, 'GET')
            })
        })
    })

    describe('alternative conventions', () => {
        describe('resource', () => {
            it('should use the resource', () => {
                // given
                herbarium.reset()
                const { entity } = anEntity({ name: 'Entity Name' })
                const { anUC } = anUseCase({ crud: herbarium.crud.read, entity })

                class NewResource extends Resource {
                    build() {
                        return 'newName'
                    }
                }

                // when
                endpoints({ herbarium, injection: { Resource: NewResource } }, {
                    '': (endpoints) => endpoints.build(),
                })

                // then
                const endpoint = herbarium.nodes.find({ type: endpoints.NodeType })[0]
                assert.equal(endpoint.value.resource, 'newName')
            })
        })

        describe('path', () => {
            it('should use the path', () => {
                // given
                herbarium.reset()
                const { entity } = anEntity({ name: 'Entity Name' })
                const { anUC } = anUseCase({ crud: herbarium.crud.read, entity })

                class NewPath extends Path {
                    build() {
                        return 'newPath'
                    }
                }

                // when
                endpoints({ herbarium, injection: { Path: NewPath } }, {
                    '': (endpoints) => endpoints.build(),
                })

                // then
                const endpoint = herbarium.nodes.find({ type: endpoints.NodeType })[0]
                assert.equal(endpoint.value.path, 'newPath')
            })
        })

        describe('method', () => {
            it('should use the method', () => {
                // given
                herbarium.reset()
                const { entity } = anEntity({ name: 'Entity Name' })
                const { anUC } = anUseCase({ crud: herbarium.crud.read, entity })

                class NewHTTPMethod extends HTTPMethod {
                    static parse() {
                        return 'newMethod'
                    }
                }

                // when
                endpoints({ herbarium, injection: { HTTPMethod: NewHTTPMethod } }, {
                    '': (endpoints) => endpoints.build(),
                })

                // then
                const endpoint = herbarium.nodes.find({ type: endpoints.NodeType })[0]
                assert.equal(endpoint.value.method, 'newMethod')
            })
        })

        describe('parameters', () => {
            it('should use the parameters', () => {
                // given
                herbarium.reset()
                const { entity } = anEntity({ name: 'Entity Name' })
                const { anUC } = anUseCase({ crud: herbarium.crud.read, entity })

                class NewParameter extends Parameter {
                    build() {
                        return 'newParameters'
                    }
                }

                // when
                endpoints({ herbarium, injection: { Parameter: NewParameter } }, {
                    '': (endpoints) => endpoints.build(),
                })

                // then
                const endpoint = herbarium.nodes.find({ type: endpoints.NodeType })[0]
                assert.equal(endpoint.value.parameters, 'newParameters')
            })
        })

        describe('parameters handler', () => {
            it('should use the parameters handler', () => {
                // given
                herbarium.reset()
                const { entity } = anEntity({ name: 'Entity Name' })
                const { anUC } = anUseCase({ crud: herbarium.crud.read, entity })

                class NewParameter extends Parameter {
                    static handler = () => 'newParameters'
                }

                // when
                endpoints({ herbarium, injection: { Parameter: NewParameter } }, {
                    '': (endpoints) => endpoints.build(),
                })

                // then
                const endpoint = herbarium.nodes.find({ type: endpoints.NodeType })[0]
                assert.equal(endpoint.value.parametersHandler(), 'newParameters')
            })
        })
    })

})