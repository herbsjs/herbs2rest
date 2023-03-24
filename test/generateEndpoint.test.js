const { herbarium } = require('@herbsjs/herbarium')
const assert = require('assert').strict

describe('generateEndpoint', () => {

    const anUseCase = ({ crud }) => {

        const anUC = () => usecase(`${crud} Usecase`, {
            request: { id: Number },
            authorize: async _ => Ok(),
            'A Step': step(_ => Ok())
        })

        herbarium.usecases.add(anUC, `${crud}Usecase`)

        return { anUC, herbarium }
    }

    describe('when a usecase has all the REST metadata', () => {
        describe('should generate the endpoint', () => {

            function aServer() {
                const server = {
                    get path() { return this._path },
                    get verb() { return this._verb },
                    get controller() { return this._controller },
                    get: (path, controller) => { this._path = path; this._verb = 'GET'; this._controller = controller },
                    post: (path, controller) => { this._path = path; this._verb = 'POST'; this._controller = controller },
                    put: (path, controller) => { this._path = path; this._verb = 'PUT'; this._controller = controller },
                    delete: (path, controller) => { this._path = path; this._verb = 'DELETE'; this._controller = controller }
                }
                return server
            }

            it('for a GET', () => {
                // given
                herbarium.reset()
                const operation = herbarium.crud.read
                const { uc } = anUseCase({ crud: operation })
                const metadata = {
                    verb: 'GET',
                    path: '/readEntities/:id',
                    resource: 'readEntities',
                    params: { id: Number },
                    controller: (usecase, req, user, res, next, methodName) => 1
                }
                herbarium.usecases.get(`${operation}Usecase`).metadata({ REST: metadata })
                const server = aServer()

                // when
                genereateEndpoints({ herbarium, server })

                // then
                assert.equal(server.path, '/readEntities/:id')
                assert.equal(server.verb, 'GET')
                assert.equal(server.controller, metadata.controller)
            })
        })
    })
})
