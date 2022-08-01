import request from 'supertest';

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      ping: jest.fn(async () => {
        throw new Error();
      }),
      set: jest.fn(async () => {
        return;
      }),
      on: jest.fn(async () => {
        return;
      }),
    };
  });
});

import {app} from '../../../../main/app';

describe('Draft Store Health Check - DOWN', () => {
  it('When draft store not responding, health check should return DOWN', async () => {
    await request(app)
      .get('/health')
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.body.status).toBe('DOWN');
      });
  });
});
