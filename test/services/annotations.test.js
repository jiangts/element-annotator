const assert = require('assert');
const app = require('../../src/app');

describe('\'annotations\' service', () => {
  it('registered the service', () => {
    const service = app.service('annotations');

    assert.ok(service, 'Registered the service');
  });
});
