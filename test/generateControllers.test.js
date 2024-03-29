const assert = require('assert')
const request = require('supertest')

const { Ok, step, usecase, entity, field } = require('@herbsjs/herbs')
const express = require('express')

const { herbarium } = require('@herbsjs/herbarium')
const generateRoutes = require('../src/generateRoutes')
const generateControllers = require('../src/generateControllers')

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

    herbarium.usecases
      .add(crudOperation('Other'), 'ReadAllCustomUsecase')
      .metadata({ group: 'Test', operation: herbarium.crud.other, entity: Test })
  }

  before(() => usecaseTest())

  it('Should return 404 error without a getAll route', (done) => {
    // Given
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

describe('Herbs2Rest - Generate Custom Routes With Herbarium', () => {
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
    herbarium.requireAll({})

    herbarium.entities
      .add(Test, 'Test')

    herbarium.usecases
      .add(crudOperation('Read'), 'ReadUsecase')
      .metadata({
        group: 'Test', operation: herbarium.crud.read, entity: Test,
        REST: {
          get: '/customgetbyid/:id',
        }
      })

    herbarium.usecases
      .add(crudOperation('ReadAll'), 'ReadAllUsecase')
      .metadata({
        group: 'Test', operation: herbarium.crud.readAll, entity: Test,
        REST: {
          get: '/customget',
        }
      })

    herbarium.usecases
      .add(crudOperation('Create'), 'CreateUsecase')
      .metadata({
        group: 'Test', operation: herbarium.crud.create, entity: Test, REST: {
          post: '/custompost'
        }
      })

    herbarium.usecases
      .add(crudOperation('Update'), 'UpdateUsecase')
      .metadata({
        group: 'Test', operation: herbarium.crud.update, entity: Test, REST: {
          put: '/customput'
        }
      })

    herbarium.usecases
      .add(crudOperation('Delete'), 'DeleteUsecase')
      .metadata({
        group: 'Test', operation: herbarium.crud.delete, entity: Test,
        REST: {
          delete: '/customdeletebyid/:id'
        }
      })
  }

  before(() => usecaseTest())

  it('getById - should ignore the conventions and use the given path', (done) => {
    // Given
    const app = express()
    const routes = new express.Router()

    const controllers = generateControllers({ herbarium })

    // When
    generateRoutes(controllers, routes, true)

    // Then
    request(app.use(routes))
      .get('/customgetbyid/1')
      .expect(200, done)
  })

  it('post - should ignore the conventions and use the given path', (done) => {
    // Given
    const app = express()
    const routes = new express.Router()
    const controllers = generateControllers({ herbarium })

    // When
    generateRoutes(controllers, routes, true)

    // Then
    request(app.use(routes))
      .post('/custompost')
      .expect(200, done)
  })

  it('getAll - should ignore the conventions and use the given path', (done) => {
    // Given
    const app = express()
    const routes = new express.Router()

    const controllers = generateControllers({ herbarium })

    // When
    generateRoutes(controllers, routes, true)

    // Then
    request(app.use(routes))
      .get('/customget')
      .expect(200, done)
  })

  it('put - should ignore the conventions and use the given path', (done) => {
    // Given
    const app = express()
    const routes = new express.Router()

    const controllers = generateControllers({ herbarium })

    // When
    generateRoutes(controllers, routes, true)

    // Then
    request(app.use(routes))
      .put('/customput')
      .expect(200, done)
  })

  it('delete - should ignore the conventions and use the given path', (done) => {
    // Given
    const app = express()
    const routes = new express.Router()

    const controllers = generateControllers({ herbarium })

    // When
    generateRoutes(controllers, routes, true)

    // Then
    request(app.use(routes))
      .delete('/customdeletebyid/1')
      .expect(200, done)
  })

  it('other - should ignore the conventions and use the given path and verb', (done) => {
    // Given
    const app = express()
    const routes = new express.Router()

    herbarium.usecases
      .add(crudOperation('Other'), 'OtherCustomUsecase')
      .metadata({
        group: 'Test', operation: herbarium.crud.other, entity: Test,
        REST: {
          get: '/other'
        }
      })

    const controllers = generateControllers({ herbarium })

    // When
    generateRoutes(controllers, routes, true)

    // Then
    request(app.use(routes))
      .get('/other')
      .expect(200, done)
  })

  it('other - should not ignore the conventions and use the resourceName and default verb', (done) => {
    // Given
    const app = express()
    const routes = new express.Router()

    herbarium.usecases
      .add(crudOperation('Other'), 'OtherCustomUsecaseResource')
      .metadata({
        group: 'Test', operation: herbarium.crud.other, entity: Test,
        REST: {
          resourceName: 'testresourcename',
        }
      })

    const controllers = generateControllers({ herbarium })

    // When
    generateRoutes(controllers, routes, true)

    // Then
    request(app.use(routes))
      .post('/testresourcename')
      .expect(200, done)
  })

  it('other - should ignore the conventions and group and use the given path', (done) => {
    // Given
    const app = express()
    const routes = new express.Router()

    herbarium.usecases
      .add(crudOperation('Other'), 'UsecaseWithoutGroup')
      .metadata({
        operation: herbarium.crud.other, entity: Test,
        REST: {
          post: '/usecasewithoutgroup',
        }
      })

    const controllers = generateControllers({ herbarium })

    // When
    generateRoutes(controllers, routes, true)

    // Then
    request(app.use(routes))
      .post('/usecasewithoutgroup')
      .expect(200, done)
  })

})
