import request from 'supertest';

jest.mock('redis');
import {createClient} from 'redis';

const mockedCreateClient = createClient as jest.MockedFunction<(...args: unknown[]) => unknown>;
const mockedRedisClient = {
  connect: jest.fn(async () => ''),
  ping: jest.fn(async () => 'PONG'),
};
mockedCreateClient.mockReturnValue(mockedRedisClient);

import {app} from '../../../../main/app';

describe('Draft Store Health Check - UP', () => {
  test('When draft store responding, health check should return UP', async () => {
    await request(app)
      .get('/health')
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('UP');
      });
  });
});
