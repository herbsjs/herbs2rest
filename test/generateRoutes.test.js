const assert = require('assert')
const request = require('supertest')

const { Router } = require('express')

const generateRoutes = require('../src/generateRoutes')

describe('Herbs2Rest - Generate Routes', () => {
  it('Should resolve and create a get all route', async () => {
    // Given
    const routes = new Router()

    const controllerList = [
      {
        name: 'lists',
        getAll: {},
      },
    ]

    // When
    await generateRoutes(controllerList, routes)

    // Then
    request(routes)
      .get('/lists')
      .expect(200)
  }),

  it('Should resolve and create a get by id route', async () => {
    // Given
    const routes = new Router()

    const controllerList = [
      {
        name: 'lists',
        getById: {},
      },
    ]

    // When
    await generateRoutes(controllerList, routes)

    // Then
    request(routes)
      .get('/lists/1')
      .expect(200)
  }),

  it('Should resolve and create a post route', async () => {
    // Given
    const routes = new Router()

    const controllerList = [
      {
        name: 'lists',
        post: {},
      },
    ]

    // When
    await generateRoutes(controllerList, routes)

    // Then
    request(routes)
      .post('/lists')
      .expect(200)
  }),

  it('Should resolve and create a put route', async () => {
    // Given
    const routes = new Router()

    const controllerList = [
      {
        name: 'lists',
        put: {},
      },
    ]

    // When
    await generateRoutes(controllerList, routes)

    // Then
    request(routes)
      .put('/lists/1')
      .expect(200)
  }),

  it('Should resolve and create a delete route', async () => {
    // Given
    const routes = new Router()

    const controllerList = [
      {
        name: 'lists',
        delete: {},
      },
    ]

    // When
    await generateRoutes(controllerList, routes)

    // Then
    request(routes)
      .del('/lists/1')
      .expect(200)
  })

  it('Should throw a JavascriptError if controllersList is null', async () => {
    const routes = new Router()

    assert.rejects(async () => await generateRoutes(null, routes))
  })
})
