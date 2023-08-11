const { endpoints } = require('./endpoints')
const { routes } = require('./routes')
module.exports = {
  generateRoutes: require('./legacy/generateRoutes'),
  generateControllers: require('./legacy/generateControllers'),
  req2request: require('./legacy/helpers/req2request'),
  endpoints,
  routes
}