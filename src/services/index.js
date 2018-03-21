const pages = require('./pages/pages.service.js');
const annotations = require('./annotations/annotations.service.js');
module.exports = function () {
  const app = this; // eslint-disable-line no-unused-vars
  app.configure(pages);
  app.configure(annotations);
};
