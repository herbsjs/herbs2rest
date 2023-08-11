const { herbarium } = require('@herbsjs/herbarium')
const { usecase, step, Ok, entity, id, field } = require('@herbsjs/herbs')
const assert = require('assert').strict
const { Parameter } = require('../../src/builders/parameter')
const { endpoints } = require('../../src/endpoints')

describe('parameter', () => {

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
    describe('#handler', () => {
        it('TO DO')
    })

    describe('#toJSON', () => {
        describe('native types', () => {
            it('should convert to JSON', () => {
                // given
                herbarium.reset()
                const operation = herbarium.crud.update
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
                endpoints({ herbarium }, {
                    '': (endpoints) => endpoints.build(),
                })
                const endpoint = herbarium.nodes.find({ type: endpoints.NodeType })[0]

                // when
                const parameter = Parameter.toJSON(endpoint.value.parameters)

                // then
                assert.deepEqual(parameter, {
                    params: { id: 'Number' },
                    body: { name: 'String', age: 'Number', isAdult: 'Boolean', birthDate: 'Date', address: 'Object', hobbies: 'Array' }
                })
            })
        })
        describe('native types as array', () => {
            it('should convert to JSON', () => {
                // given
                herbarium.reset()
                const operation = herbarium.crud.update
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
                endpoints({ herbarium }, {
                    '': (endpoints) => endpoints.build(),
                })
                const endpoint = herbarium.nodes.find({ type: endpoints.NodeType })[0]

                // when
                const parameter = Parameter.toJSON(endpoint.value.parameters)

                // then
                assert.deepEqual(parameter, {
                    params: { id: ['Number'] },
                    body: { name: ['String'], age: ['Number'], isAdult: ['Boolean'], birthDate: ['Date'], address: ['Object'], hobbies: ['Array'] }
                })
            })
        })
        describe('entity types', () => {
            it('should convert to JSON', () => {
                // given
                herbarium.reset()
                const operation = herbarium.crud.update
                const { entity: Item } = anEntity({
                    name: `Item`, fields: {
                        id: id(Number),
                        desc: field(String),
                        aFunction() { }
                    }
                })
                const { entity: Customer } = anEntity({
                    name: `Customer`, fields: {
                        id: id(Number),
                        name: field(String),
                        aFunction() { }
                    }
                })
                const { entity: Order } = anEntity({
                    name: `Order`, fields: {
                        id: id(Number),
                        items: field([Item]),
                        customer: field(Customer),
                        aFunction() { }
                    }
                })
                const request = {
                    id: Number,
                    items: [Item],
                    customer: Customer
                }
                anUseCase({ crud: operation, entity: Order, request })
                endpoints({ herbarium }, {
                    '': (endpoints) => endpoints.build(),
                })
                const endpoint = herbarium.nodes.find({ type: endpoints.NodeType })[0]

                // when
                const parameter = Parameter.toJSON(endpoint.value.parameters)

                // then
                assert.deepEqual(parameter, {
                    params: { id: 'Number' },
                    body: {
                        items: [{ id: 'Number' }], customer: { id: 'Number' }
                    }   
                })
            })
        })
    })
})