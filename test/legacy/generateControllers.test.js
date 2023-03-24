const assert = require('assert')
const request = require('supertest')

const { Ok, step, usecase, entity, field } = require('@herbsjs/herbs')
const express = require('express')

const { herbarium } = require('@herbsjs/herbarium')
const generateRoutes = require('../../src/legacy/generateRoutes')
const generateControllers = require('../../src/legacy/generateControllers')

describe('Herbs2Rest - Generate Routes With Herbarium', () => {

  const Test =
    entity('Test', {
      id: field(Number, { isId: true })
    })

  const crudOperation = (param) => () => usecase(`${param} Usecase`, {
    request: {},
    authorize: async _ => Ok(),
    'Test step': step(_ => Ok())
  })

  const usecaseTest = () => {
    herbarium.reset()
    herbarium.requireAll({})

    herbarium.entities
      .add(Test, 'Test')

    herbarium.usecases
      .add(crudOperation('Read'), 'ReadUsecase')
      .metadata({ group: 'Test', operation: herbarium.crud.read, entity: Test })

    herbarium.usecases
      .add(crudOperation('Create'), 'CreateUsecase')
      .metadata({ group: 'Test', operation: herbarium.crud.create, entity: Test })

    herbarium.usecases
      .add(crudOperation('Update'), 'UpdateUsecase')
      .metadata({ group: 'Test', operation: herbarium.crud.update, entity: Test })

    herbarium.usecases
      .add(crudOperation('Delete'), 'DeleteUsecase')
      .metadata({ group: 'Test', operation: herbarium.crud.delete, entity: Test })
  }

  it('Should return 404 error without a getAll route', (done) => {
    // Given
    usecaseTest()
    const app = express()
    const routes = new express.Router()

    const controllers = generateControllers({ herbarium })

    // When
    generateRoutes(controllers, routes, true)

    // Then
    request(app.use(routes))
      .get('/test')
      .expect(404, done)
  })

  it('Should resolve and create a get all route after add inside Herbarium usecase list', (done) => {
    // Given
    usecaseTest()
    const app = express()
    const routes = new express.Router()

    herbarium.usecases
      .add(crudOperation('ReadAll'), 'ReadAllUsecase')
      .metadata({ group: 'Test', operation: herbarium.crud.readAll, entity: Test })

    const controllers = generateControllers({ herbarium })

    // When
    generateRoutes(controllers, routes, true)

    // Then
    request(app.use(routes))
      .get('/test')
      .expect(200, done)
  })

  it('Should resolve and create a get by id route', (done) => {
    // Given
    usecaseTest()
    const app = express()
    const routes = new express.Router()
    const controllers = generateControllers({ herbarium })

    // When
    generateRoutes(controllers, routes, true)

    // Then
    request(app.use(routes))
      .get('/test/1')
      .expect(200, done)
  }),

    it('Should resolve and create a post route', (done) => {
      // Given
      usecaseTest()
      const app = express()
      const routes = new express.Router()
      const controllers = generateControllers({ herbarium })

      // When
      generateRoutes(controllers, routes, true)

      // Then
      request(app.use(routes))
        .post('/test')
        .expect(200, done)
    }),

    it('Should resolve and create a put route', (done) => {
      // Given
      usecaseTest()
      const app = express()
      const routes = new express.Router()
      const controllers = generateControllers({ herbarium })

      // When
      generateRoutes(controllers, routes, true)

      // Then
      request(app.use(routes))
        .put('/test/1')
        .expect(200, done)
    }),

    it('Should resolve and create a delete route', (done) => {
      // Given
      usecaseTest()
      const app = express()
      const routes = new express.Router()
      const controllers = generateControllers({ herbarium })

      // When
      generateRoutes(controllers, routes, true)

      // Then
      request(app.use(routes))
        .del('/test/1')
        .expect(200, done)
    })

  it('Should throw a JavascriptError if controllersList is null', () => {
    assert.rejects(() => generateRoutes(null, routes))
  })
})
