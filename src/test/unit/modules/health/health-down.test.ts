import request from 'supertest';

jest.mock('redis');
import {createClient} from 'redis';

const mockedCreateClient = createClient as jest.MockedFunction<(...args: unknown[]) => unknown>;
const mockedRedisClient = {
  connect: jest.fn(async () => ''),
  ping: jest.fn(async () => {
    throw new Error();
  }),
};
mockedCreateClient.mockReturnValue(mockedRedisClient);

import {app} from '../../../../main/app';

describe('Draft Store Health Check - DOWN', () => {
  test('When draft store not responding, health check should return DOWN', async () => {
    await request(app)
      .get('/health')
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.body.status).toBe('DOWN');
      });
  });
});
