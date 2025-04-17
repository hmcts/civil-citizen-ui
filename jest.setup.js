afterAll(() => {
  const nock = require('nock');

  nock.cleanAll();
  nock.restore();
});
