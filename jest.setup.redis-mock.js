jest.mock('ioredis', () => jest.requireActual('ioredis-mock'));
jest.mock('./src/main/app/auth/launchdarkly/launchDarklyClient');
