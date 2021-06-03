![Node.js CI](https://github.com/herbsjs/herbs2rest/workflows/Node.js%20CI/badge.svg?branch=master)[![codecov](https://codecov.io/gh/herbsjs/herbs2rest/branch/master/graph/badge.svg)](https://codecov.io/gh/herbsjs/herbs2rest)

# herbs2rest
Create a REST API based on herbs entities ([gotu](https://github.com/herbsjs/gotu)) and usecases ([buchu](https://github.com/herbsjs/buchu)).


### Installing

    $ npm install herbs2rest

### Using

Use the method generateRoutes to generate api rest routes based on usecases.

herbs2rest works with [express](https://expressjs.com/) in version [4.x](https://expressjs.com/en/4x/api.html).

#### Controller List

The method needs a list of controllers like the example below:

```javascript
const controllerList = [
  {
    name: 'lists',
    getAll: { useCase: require('../usecases/getLists'), customController: require('../customController') },
    getById: { useCase: require('../usecases/getLists'), idParameter: 'listId' },
    post: { useCase: require('../usecases/createList') },
    put: { useCase: require('../usecases/updateList') },
    delete: { useCase: require('../usecases/deleteList') }
  }
]
```

The name field is the name of the route.

The idParameter field is the param of the route.

The customController field is to replace the default controller.

The other fields refer to http methods using usecases (GetAll, GetById, Post, Put and Delete).

#### Custom Controller

To create a custom controller, it is necessary to follow this pattern.

```javascript
const customController = async (usecase, req, user, res, next) => {
  // Implementation
}
```

Each method parameter has different data:

- usecase: usecase in ([buchu](https://github.com/herbsjs/buchu)) pattern.
- req: body, query and params of route.
- user: parameter passed in the request.
- res: response object of [express](https://expressjs.com/).
- next: allows the next queued route handler/middleware to handle the request.

#### Generate Routes

Generating and using new express routes:

```javascript
const express = require('express')
const { generateRoutes } = require('herbs2rest')

const app = express()
const routes = new express.Router()

generateRoutes(controllerList, routes)

app.use(routes)
```

#### Authorization

All use cases must implement the authorization method and receive a user for authentication if using the default controller.

Example:

```javascript
const { Ok, Err, usecase } = require('buchu')

const testUseCase = (injection) =>
  usecase('Test UseCase', {
    authorize: (user) => {
      if (user === 'admin')
        return Ok()
      else
        return Err('Invalid user')
    }
  })
```

---

#### Example

Additionally you can view a simple demo application of this library in [todolist-on-herbs](https://github.com/herbsjs/todolist-on-herbs).

## How to contribute

If you would like to help contribute to this repository, please see [CONTRIBUTING](https://github.com/herbsjs/herbs2rest/blob/master/.github/CONTRIBUTING.md)

---

### License

- [MIT License](https://github.com/herbsjs/herbs2rest/blob/master/LICENSE)
