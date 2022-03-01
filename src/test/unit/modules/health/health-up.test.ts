import request from 'supertest';
import {app} from '../../../../main/app';

jest.mock('redis');


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
