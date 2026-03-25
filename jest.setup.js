const nock = require('nock');

jest.retryTimes(2);

afterAll(() => {
  nock.cleanAll();
  nock.restore();
});
