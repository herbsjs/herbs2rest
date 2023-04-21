[![Build](https://github.com/herbsjs/herbs2rest/actions/workflows/cd.yml/badge.svg?branch=main)](https://github.com/herbsjs/herbs2rest/actions/workflows/cd.yml)[![codecov](https://codecov.io/gh/herbsjs/herbs2rest/branch/main/graph/badge.svg)](https://codecov.io/gh/herbsjs/herbs2rest)

# herbs2rest
Create a REST API based on herbs entities ([gotu](https://github.com/herbsjs/gotu)) and usecases ([buchu](https://github.com/herbsjs/buchu)).


### Installing
```
    $ npm install @herbsjs/herbs2rest
```

### Usage

Supported HTTP verbs are: `GET`, `POST`, `PUT`, and `DELETE`.

To use herbs2rest, the use cases must be exported with Herbarium, along with some metadata that includes the `group`, `operation`, and `entity`.

The operation is exported by Herbarium in `herbarium.crud` and can be: `create`, `read`, `readAll`, `update`, `delete`, or `other`. This `operation` field is utilized by Herbs2Rest, following specific conventions to determine the type of REST endpoint to be created for Express, whether it is a `GET` or `POST` endpoint, according to the use case metadata.

Example:

```javascript
module.exports = 
  herbarium.usecases
    .add(createUser, 'CreateUser')
    .metadata({
      group: 'User',
      operation: herbarium.crud.create,
      entity: User,
    }) 
    .usecase
```

Herbs2REST works with [express](https://expressjs.com/) in version [4.x](https://expressjs.com/en/4x/api.html).

#### Herbarium

The default method needs a list of controllers returned by the generateControllers function using Herbarium.

```javascript
const controllersList = generateControllers({ herbarium })
```

#### Controller List

You can pass a list of controllers like the example below, instead of generate controllers with herbarium:

```javascript
const controllerList = [
  {
    name: 'lists',
    entity: require('../entities/user')
    getAll: { usecase: require('../usecases/getLists'), controller: require('../controller') },
    getById: { usecase: require('../usecases/getLists'), id: 'listId' },
    post: { usecase: require('../usecases/createList') },
    put: { usecase: require('../usecases/updateList') },
    delete: { usecase: require('../usecases/deleteList') }
  }
]
```

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

const showEndpoints = true

generateRoutes(controllers, routes, showEndpoints)

app.use(routes)
```

#### Generate Routes (Advanced)

Generating and using new express routes:

```javascript
const express = require('express')
const { generateRoutes } = require('@herbsjs/herbs2rest')

const app = express()
const routes = new express.Router()

const showEndpoints = true

generateRoutes(controllerList, routes, showEndpoints)

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


#### Custom Endpoints

You can configure custom REST endpoints and HTTP verbs for your use cases by modifying the `metadata` object of the use case. To do this, include a `REST` key in the metadata, containing a JavaScript object with the HTTP verb as the key and the desired path as the value.

Supported HTTP verbs are: `GET`, `POST`, `PUT`, and `DELETE`.

The path should be a string starting with a forward slash (`/`), followed by the desired path.

Example:

```javascript
module.exports = 
  herbarium.usecases
    .add(createUser, 'CreateUser')
    .metadata({
      group: 'User',
      operation: herbarium.crud.create,
      entity: User,
      REST: { post: '/createuser' }
    }) 
    .usecase
```

Route generated:
```bash
POST /createuser -> Create User
```

You can also customize the resourceName by providing a string within the REST object. This will update the default route for the use case, adhering to conventions. By default, the resourceName is derived from the group in the metadata.

Example:

```javascript
module.exports = 
  herbarium.usecases
    .add(createUser, 'CreateUser')
    .metadata({
      group: 'User',
      operation: herbarium.crud.create,
      entity: User,
      REST: { resourceName: 'customer' }
    })
    .usecase
```

Route generated:
```bash
POST /customer -> Create User
```

By using custom endpoints and verbs, you can create a more flexible API that better suits your application's needs. This allows for more intuitive paths and better organization of your API resources.

---

#### Example

Additionally you can view a simple demo application of this library in [todolist-on-herbs](https://github.com/herbsjs/todolist-on-herbs).

## How to contribute

If you would like to help contribute to this repository, please see [CONTRIBUTING](https://github.com/herbsjs/herbs2rest/blob/master/.github/CONTRIBUTING.md)

---

### License

- [MIT License](https://github.com/herbsjs/herbs2rest/blob/master/LICENSE)
