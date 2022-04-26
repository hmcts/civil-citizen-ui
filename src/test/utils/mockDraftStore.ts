import { TestMessages } from './errorMessageTestConstants';
import civilClaimResponseMock from './mocks/civilClaimResponseMock.json';
import noStatementOfMeansMock from './mocks/noStatementOfMeansMock.json';
import civilClaimResponseOptionNoMock from './mocks/civilClaimResponseOptionNoMock.json';
import civilClaimResponseUnemploymentRetired from './mocks/civilClaimResponseUnemploymentRetiredMock.json';
import civilClaimResponseUnemploymentOther from './mocks/civilClaimResponseUnemploymentOtherMock.json';

const mockCivilClaim = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseMock))),
};
const mockCivilClaimUndefined = {
  set: jest.fn(() => Promise.resolve(undefined)),
  get: jest.fn(() => Promise.resolve(undefined)),
};
const mockNoStatementOfMeans = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(noStatementOfMeansMock))),
};
const mockCivilClaimOptionNo = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseOptionNoMock))),
};
const mockCivilClaimUnemploymentRetired = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseUnemploymentRetired))),
};
const mockCivilClaimUnemploymentOther = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseUnemploymentOther))),
};
const mockRedisFailure = {
  set: jest.fn(() => { throw new Error(TestMessages.REDIS_FAILURE); }),
  get: jest.fn(() => { throw new Error(TestMessages.REDIS_FAILURE); }),
};

export { mockCivilClaim, mockCivilClaimUndefined, mockNoStatementOfMeans, mockCivilClaimOptionNo,
  mockCivilClaimUnemploymentRetired, mockCivilClaimUnemploymentOther, mockRedisFailure };
