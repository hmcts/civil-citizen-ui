import request from 'supertest';
import nock from 'nock';
import {app} from '../../../../main/app';
import * as launchDarkly from '../../../../main/app/auth/launchdarkly/launchDarklyClient';

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      ping: jest.fn(async () => 'PONG'),
      set: jest.fn(async () => {return;}),
      on: jest.fn(async () => {
        return;
      }),
      ttl: jest.fn(() => Promise.resolve({})),
      expireat: jest.fn(() => Promise.resolve({})),
    };
  });
});

describe('Draft Store Health Check - UP', () => {
  beforeEach(() => {
    // hmcts-access-migration flag ON so the gated sign-in probe is evaluated
    jest.spyOn(launchDarkly, 'isHmctsAccessMigrationEnabled').mockResolvedValue(true);
    // HMCTS Access sign-in page probe reachable and returning 200
    nock('http://localhost:9002').get('/health').reply(200).persist();
  });

  afterEach(() => {
    nock.cleanAll();
    jest.restoreAllMocks();
  });

  it('When draft store responding, health check should return UP', async () => {
    await request(app)
      .get('/health')
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('UP');
        expect(res.body['hmcts-access'].status).toBe('UP');
      });
  });
});
