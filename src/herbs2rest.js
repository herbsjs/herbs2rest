const { populateMetadata } = require('./populateMetadata')
const { generateEndpoints } = require('./generateEndpoints')

module.exports = {
  generateRoutes: require('./legacy/generateRoutes'),
  generateControllers: require('./legacy/generateControllers'),
  req2request: require('./legacy/helpers/req2request'),
  populateMetadata,
  generateEndpoints
}