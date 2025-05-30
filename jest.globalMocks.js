/**
 * These mocks run ONCE per Jest worker.
 * That means ~4× total instead of 837×.
 */

/* ----  Redis  ---- */
jest.mock('ioredis', () => require('ioredis-mock'));

/* ----  LaunchDarkly ---- */
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
  /* important: the real SDK returns Promises here */
  waitForInitialization: jest.fn().mockResolvedValue(undefined),
  waitUntilGoalsReady: jest.fn().mockResolvedValue(undefined),
  waitUntilReady: jest.fn().mockResolvedValue(undefined),
};

jest.mock('launchdarkly-node-server-sdk', () => ({
  init: jest.fn(() => ldClientMock),
}));
