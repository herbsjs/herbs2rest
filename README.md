![Node.js CI](https://github.com/herbsjs/herbs2rest/actions/workflows/on_push.yml/badge.svg?branch=main)[![codecov](https://codecov.io/gh/herbsjs/herbs2rest/branch/main/graph/badge.svg)](https://codecov.io/gh/herbsjs/herbs2rest)

# herbs2rest
Create a REST API based on herbs entities ([gotu](https://github.com/herbsjs/gotu)) and usecases ([buchu](https://github.com/herbsjs/buchu)).


### Installing
```
    $ npm install @herbsjs/herbs2rest
```

### Using

Use the method generateRoutes to generate api rest routes based on usecases.

herbs2rest works with [express](https://expressjs.com/) in version [4.x](https://expressjs.com/en/4x/api.html).

#### Herbarium

The default method needs a list of controllers returned by the generateControllers function using Herbarium.

#### Controller List

The advanced method needs a list of controllers like the example below:

```javascript
const controllerList = [
  {
    name: 'lists',
    getAll: { usecase: require('../usecases/getLists'), controller: require('../controller') },
    getById: { usecase: require('../usecases/getLists'), id: 'listId' },
    post: { usecase: require('../usecases/createList') },
    put: { usecase: require('../usecases/updateList') },
    delete: { usecase: require('../usecases/deleteList') }
  }
]
```

The `name` field is the name of the route.

The `id` field is the param of the route.

The `controller` field is to replace the default controller.

The other fields refer to http methods using usecases (GetAll, GetById, Post, Put and Delete).

#### Custom Controller

To create a custom controller, it is necessary to follow this pattern.

```javascript
const controller = async (usecase, req, user, res, next) => {
  // Implementation
}
```

Each method parameter has different data:

- usecase: usecase in ([buchu](https://github.com/herbsjs/buchu)) pattern.
- req: body, query and params of route.
- user: parameter passed in the request.
- res: response object of [express](https://expressjs.com/).
- next: allows the next queued route handler/middleware to handle the request.

#### Generate Routes with Herbarium

If you already use Herbarium, a centralized and standardized repository and discovery service for Herbs objects, you can automatically generate and use new express routes:

```javascript
const express = require('express')
const { herbarium } = require('@herbsjs/herbarium')
const { generateControllers, generateRoutes } = require('@herbsjs/herbs2rest')

const app = express()
const routes = new express.Router()
const controllers = generateControllers(herbarium)

generateRoutes(controllers, routes, true)  // true = console info endpoints

app.use(routes)
```

#### Generate Routes (Advanced)

Generating and using new express routes:

```javascript
const express = require('express')
const { generateRoutes } = require('@herbsjs/herbs2rest')

const app = express()
const routes = new express.Router()

generateRoutes(controllerList, routes, true)  // true = console info endpoints

app.use(routes)
```

#### HTTP Status Code and Err

Herbs2rest translates Herbs [Known Errors​](https://herbsjs.org/docs/usecase/result#known-errors) to HTTP status code as described in the documentation.

#### Authorization

All use cases must implement the authorization method and receive a user for authentication if using the default controller.

Example:

```javascript
const { Ok, Err, usecase } = require('@herbsjs/buchu')

const testUseCase = (injection) =>
  usecase('Test UseCase', {
    authorize: async (user) => {
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
