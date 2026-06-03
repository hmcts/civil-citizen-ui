import request from 'supertest';
import nock from 'nock';

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
      ttl: jest.fn(() => Promise.resolve({})),
      expireat: jest.fn(() => Promise.resolve({})),
    };
  });
});

import {app} from '../../../../main/app';

describe('Draft Store Health Check - DOWN', () => {
  beforeEach(() => {
    // Keep the HMCTS Access probe healthy so the DOWN status is driven by the draft store
    nock('http://localhost:9002').get('/health').reply(200).persist();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('When draft store not responding, health check should return DOWN', async () => {
    await request(app)
      .get('/health')
      .expect((res) => {
        expect(res.status).toBe(503);
        expect(res.body.status).toBe('DOWN');
      });
  });
});
