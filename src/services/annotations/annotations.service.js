// Initializes the `annotations` service on path `/annotations`
const createService = require('feathers-nedb');
const createModel = require('../../models/annotations.model');
const hooks = require('./annotations.hooks');
const filters = require('./annotations.filters');

module.exports = function () {
  const app = this;
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'annotations',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/annotations', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('annotations');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
