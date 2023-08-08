const assert = require('assert')
const request = require('supertest')

const { Ok, step, usecase, entity, id, field } = require('@herbsjs/herbs')
const express = require('express')

const generateRoutes = require('../../src/legacy/generateRoutes')
const defaultController = require('../../src/legacy/defaultController')

describe.skip('Legacy - Generate Routes', () => {
  const entityTest = entity('test entity', {
    testId: id(Number),
    testField: field(String)
  })

  const entityTestWithoutId = entity('test entity', {
    testField: field(String)
  })

  const usecaseTest = () =>
    usecase('Test usecase', {
      request: {},
      authorize: async _ => Ok(),
      'Test step': step(_ => Ok())
    })

  it('Should resolve and create a get all route', (done) => {
    // Given
    const app = express()
    const routes = new express.Router()

    const controllerList = [
      {
        name: 'lists',
        entity: entityTest,
        getAll: { usecase: usecaseTest, controller: defaultController }
      },
    ]

    // When
    generateRoutes(controllerList, routes)

    // Then
    request(app.use(routes))
      .get('/lists')
      .expect(200, done)
  })

  it('Should resolve and create a get all route wihout entity', (done) => {
    // Given
    const app = express()
    const routes = new express.Router()

    const controllerList = [
      {
        name: 'lists',
        entity: undefined,
        getAll: { usecase: usecaseTest, controller: defaultController }
      },
    ]

    // When
    generateRoutes(controllerList, routes)

    // Then
    request(app.use(routes))
      .get('/lists')
      .expect(200, done)
  })

  it('Should resolve and create a get by id route', (done) => {
    // Given
    const app = express()
    const routes = new express.Router()

    const controllerList = [
      {
        name: 'lists',
        entity: entityTest,
        getById: { usecase: usecaseTest, controller: defaultController }
      },
    ]

    // When
    generateRoutes(controllerList, routes)

    // Then
    request(app.use(routes))
      .get('/lists/1')
      .expect(200, done)
  }),

    it('Should resolve and create a get wihout id route', (done) => {
      // Given
      const app = express()
      const routes = new express.Router()

      const controllerList = [
        {
          name: 'lists',
          entity: entityTestWithoutId,
          getById: { usecase: usecaseTest, controller: defaultController }
        },
      ]

      // When
      generateRoutes(controllerList, routes)

      // Then
      request(app.use(routes))
        .get('/lists/1')
        .expect(200, done)
    }),

    it('Should resolve and create a post route', (done) => {
      // Given
      const app = express()
      const routes = new express.Router()

      const controllerList = [
        {
          name: 'lists',
          entity: entityTest,
          post: { usecase: usecaseTest, controller: defaultController }
        },
      ]

      // When
      generateRoutes(controllerList, routes)

      // Then
      request(app.use(routes))
        .post('/lists')
        .expect(200, done)
    }),

    it('Should resolve and create a put route', (done) => {
      // Given
      const app = express()
      const routes = new express.Router()

      const controllerList = [
        {
          name: 'lists',
          entity: entityTest,
          put: { usecase: usecaseTest, controller: defaultController }
        },
      ]

      // When
      generateRoutes(controllerList, routes)

      // Then
      request(app.use(routes))
        .put('/lists/1')
        .expect(200, done)
    }),

    it('Should resolve and create a delete route', (done) => {
      // Given
      const app = express()
      const routes = new express.Router()

      const controllerList = [
        {
          name: 'lists',
          entity: entityTest,
          delete: { usecase: usecaseTest, controller: defaultController }
        },
      ]

      // When
      generateRoutes(controllerList, routes)

      // Then
      request(app.use(routes))
        .del('/lists/1')
        .expect(200, done)
    })

  it('Should throw a JavascriptError if controllersList is null', () => {
    assert.rejects(() => generateRoutes(null, routes))
  })
})
