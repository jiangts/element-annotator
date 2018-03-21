const users = require('./users/users.service.js');
const pages = require('./pages/pages.service.js');
const assets = require('./assets/assets.service.js');
const annotations = require('./annotations/annotations.service.js');
module.exports = function () {
  const app = this; // eslint-disable-line no-unused-vars
  app.configure(users);
  app.configure(pages);
  app.configure(assets);
  app.configure(annotations);
};
