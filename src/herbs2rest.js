module.exports = {
  generateRoutes: require('./legacy/generateRoutes'),
  generateControllers: require('./legacy/generateControllers'),
  req2request: require('./legacy/helpers/req2request'),
  populateMetadata: require('./populateMetadata'),
}