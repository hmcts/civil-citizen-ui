
import {LoggerInstance} from 'winston';
import DraftStoreClient from 'modules/draft-store';

jest.mock('config');

// Mock the dependencies used by DraftStoreClient
jest.mock('config');
jest.mock('ioredis');
jest.mock('@hmcts/nodejs-logging');

describe('Draft Store Client', () => {
  let client;

  beforeEach(() => {
    client = new DraftStoreClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should set a value in Redis', async () => {
    const setValueSpy = jest.spyOn(client.client, 'set');
    const loggerInfoSpy = jest.spyOn(client.logger, 'info');

    await client.setValue('key', 'value');

    expect(setValueSpy).toHaveBeenCalledWith('key', 'value');
    expect(loggerInfoSpy).toHaveBeenCalledWith(`Mock data key saved to Redis`);
  });
});
