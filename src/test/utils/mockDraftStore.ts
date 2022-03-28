import { TestMessages } from './errorMessageTestConstants';
import civilClaimResponseMock from './mocks/civilClaimResponseMock.json';
import noStatementOfMeansMock from './mocks/noStatementOfMeansMock.json';
import civilClaimResponseOptionNoMock from './mocks/civilClaimResponseOptionNoMock.json';

const mockCivilClaim = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseMock))),
};
const mockNoStatementOfMeans = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(noStatementOfMeansMock))),
};
const mockCivilClaimOptionNo = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseOptionNoMock))),
};
const mockRedisFailure = {
  set: jest.fn(() => { throw new Error(TestMessages.REDIS_FAILURE); }),
  get: jest.fn(() => { throw new Error(TestMessages.REDIS_FAILURE); }),
};

export { mockCivilClaim, mockNoStatementOfMeans, mockCivilClaimOptionNo, mockRedisFailure };