import {createClient} from 'redis';
import {mockCreateClient} from '../../../utils/mockCreateClient';
import {DraftStoreClient} from '../../../../main/modules/draft-store';
import {LoggerInstance} from 'winston';
import express from 'express';

jest.mock('redis');

const mockedBehaviour = {
  connect: jest.fn(async () => {
    throw new Error();
  }),
};
mockCreateClient(createClient, mockedBehaviour);

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

  test('When can\'t connect to Redis, log error message', async () => {
    const draftStoreClient: DraftStoreClient = new DraftStoreClient(mockLogger);
    draftStoreClient.enableFor(app);
    await new Promise(process.nextTick);
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
  });
});
