import {DraftStoreClient} from '../../../../main/modules/draft-store';
import {LoggerInstance} from 'winston';
import express from 'express';

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      ping: jest.fn(async () => 'PONG'),
      set: jest.fn(async () => {return;}),
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

  test('Upon successful connection to Redis, log info message', async () => {
    const draftStoreClient: DraftStoreClient = new DraftStoreClient(mockLogger);
    draftStoreClient.enableFor(app);
    await new Promise(process.nextTick);
    expect(mockLogger.info).toHaveBeenCalledWith(DraftStoreClient.REDIS_CONNECTION_SUCCESS);
  });
});
