const assert = require('assert')
const { expect } = require('chai')
const request = require('supertest')

const { Ok, step, usecase } = require('@herbsjs/buchu')
const express = require('express')

const generateRoutes = require('../src/generateRoutes')

describe('Herbs2Rest - Generate Routes', () => {
  const entityTest = {
      prototype: {
        meta: {
          schema: {
            testId: {
              name: 'testId',
              options: {isId: true}
            } 
          }
        }
      }
  }
  const usecaseTest = () =>
    usecase('Test usecase', {
      request: {},
      authorize: async _ => Ok(),
      'Test step': step(_ => Ok())
    })

  it('Should get dinamically entity id', () => {
    // Given
    const route = {
      entity: entityTest
    }
    function idFieldName(route){
        let idFieldName = null
        if(route.entity){
          [idFieldName] = Object.entries(route.entity.prototype.meta.schema).find(([_key, value]) => value.options.isId)
        }
        return `/entity/${idFieldName}`
    }

    const controllerList =
      {
        name: 'lists',
        entity : entityTest,
        getAll: { 
          usecase: usecaseTest,
          endpoint: idFieldName(route)
         }
      }


    // Then
    expect(controllerList.getAll.endpoint).to.be.equal('/entity/testId')
  })

  it('Should resolve and create a get all route', (done) => {
    // Given
    const app = express()
    const routes = new express.Router()

    const controllerList = [
      {
        name: 'lists',
        entity : entityTest,
        getAll: { usecase: usecaseTest }
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
        entity : entityTest,
        getById: { usecase: usecaseTest }
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
        entity : entityTest,
        post: { usecase: usecaseTest }
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
        entity : entityTest,
        put: { usecase: usecaseTest }
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
        entity : entityTest,
        delete: { usecase: usecaseTest }
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
