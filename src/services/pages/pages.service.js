// Initializes the `pages` service on path `/pages`
const createService = require('feathers-nedb');
const createModel = require('../../models/pages.model');
const hooks = require('./pages.hooks');
const filters = require('./pages.filters');

module.exports = function () {
  const app = this;
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'pages',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/pages', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('pages');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
