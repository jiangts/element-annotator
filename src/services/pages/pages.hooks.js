const { fetchPage, processHtml } = require('./index');


const saveHtml = (options) => {
  return (hook) => {
    return fetchPage(hook.data.url)
      .then(html => hook.data.html = html)
      .then(_ => hook)
  }
}

const computeProperties = (page) => {
  page.processedhtml = processHtml(page.url, page.html)
}

const computePropertiesHook = (options) => {
  switch (options.type) {
    case 'get':
      return (hook) => {
        computeProperties(hook.result)
        return hook
      }
      break;
    case 'find':
      return (hook) => {
        hook.result.data.map(computeProperties)
        return hook
      }
  }
}


module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [ saveHtml() ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [ computePropertiesHook({type: 'find'}) ],
    get: [ computePropertiesHook({type: 'get'}) ],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
