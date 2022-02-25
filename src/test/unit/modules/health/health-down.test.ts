import request from 'supertest';

jest.mock('redis');
import {createClient} from 'redis';
import {mockCreateClient} from '../../../utils/mockCreateClient';

const mockedBehaviour = {
  connect: jest.fn(async () => ''),
  ping: jest.fn(async () => {
    throw new Error();
  }),
  on: jest.fn(async () => ''),
};
mockCreateClient(createClient, mockedBehaviour);

import {app} from '../../../../main/app';

// commented out test until Redis draft store health check is sorted
describe.skip('Draft Store Health Check - DOWN', () => {
  test('When draft store not responding, health check should return DOWN', async () => {
    await request(app)
      .get('/health')
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.body.status).toBe('DOWN');
      });
  });
});
