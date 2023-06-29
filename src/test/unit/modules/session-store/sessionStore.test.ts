import {SessionStoreClient} from 'modules/session-store';
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
    };
  });
});

const mockLogger = {
  error: jest.fn().mockImplementation((message: string) => message),
  info: jest.fn().mockImplementation((message: string) => message),
} as unknown as LoggerInstance;

const app = express();

describe('Session Store Client', () => {
  it('Upon successful connection to Redis, log info message', async () => {
    const sessionStoreClient: SessionStoreClient = new SessionStoreClient(mockLogger);
    sessionStoreClient.enableFor(app,true);
    await new Promise(process.nextTick);
    expect(mockLogger.info).toHaveBeenCalledWith(SessionStoreClient.ADD_SESSION_CONFIUGRATION_SUCCESFULY);
  });
});
