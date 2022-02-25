import {pingRedis} from '../../../../main/modules/draft-store';

jest.mock('redis');
import {createClient} from 'redis';
import {mockCreateClient} from '../../../utils/mockCreateClient';

const mockedBehaviour = {
  connect: jest.fn(() => Promise.resolve('')),
  ping: jest.fn(() => Promise.resolve('PONG')),
  on: jest.fn(() => Promise.resolve('')),
};
mockCreateClient(createClient, mockedBehaviour);

describe('Draft Store Health Check - UP', () => {
  test('When draft store responding, health check should return UP', async () => {
    pingRedis();
    expect(createClient).toHaveBeenCalledTimes(1);
  });
});
