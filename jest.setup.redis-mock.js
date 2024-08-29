const ldClientMock = {
  track: jest.fn(),
  identify: jest.fn(),
  allFlags: jest.fn(),
  close: jest.fn(),
  flush: jest.fn(),
  getContext: jest.fn(),
  off: jest.fn(),
  on: jest.fn(),
  setStreaming: jest.fn(),
  variation: jest.fn(),
  variationDetail: jest.fn(),
  waitForInitialization: jest.fn(),
  waitUntilGoalsReady: jest.fn(),
  waitUntilReady: jest.fn(),
};
jest.mock('ioredis', () => jest.requireActual('ioredis-mock'));
jest.mock('launchdarkly-node-server-sdk', () => ({
  init: jest.fn().mockReturnValue(ldClientMock),
}));