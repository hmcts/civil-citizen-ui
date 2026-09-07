import {DraftStoreClient} from 'modules/draft-store';
import {LoggerInstance} from 'winston';
import express from 'express';

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      ping: jest.fn(async () => 'PONG'),
      set: jest.fn(async () => {return;}),
      on: jest.fn(async () => {
        return;
      }),
      ttl: jest.fn(() => Promise.resolve({})),
      expireat: jest.fn(() => Promise.resolve({})),
      expire: jest.fn().mockResolvedValue(1),
    };
  });
});

const mockLogger = {
  error: jest.fn().mockImplementation((message: string) => message),
  info: jest.fn().mockImplementation((message: string) => message),
} as unknown as LoggerInstance;

const app: express.Application = {
  locals: {
    draftStoreClient: null,
  },
} as unknown as express.Application;

describe('Draft Store Client', () => {
  let originalEnv: string | undefined;
  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('Upon successful connection to Redis, log info message', async () => {
    const draftStoreClient: DraftStoreClient = new DraftStoreClient(mockLogger);
    draftStoreClient.enableFor(app);
    await new Promise(process.nextTick);
    expect(mockLogger.info).toHaveBeenCalledWith(DraftStoreClient.REDIS_CONNECTION_SUCCESS);
  });

  it('should register the "connect" listener and seed data if NODE_ENV is NOT production', async () => {
    process.env.NODE_ENV = 'development';
    const draftStoreClient = new DraftStoreClient(mockLogger);
    draftStoreClient.enableFor(app);
    await new Promise(process.nextTick);
    const mockRedisClient = app.locals.draftStoreClient;
    // Assert that the 'connect' event listener WAS registered
    expect(mockRedisClient.on).toHaveBeenCalledWith('connect', expect.any(Function));
  });

  it('should NOT register the "connect" listener or seed data if NODE_ENV is production', () => {
    process.env.NODE_ENV = 'production';
    const draftStoreClient = new DraftStoreClient(mockLogger);
    draftStoreClient.enableFor(app);
    // Assert that the 'connect' event listener WAS NOT registered
    expect(app.locals.draftStoreClient.on).not.toHaveBeenCalledWith('connect', expect.any(Function));
  });
});
