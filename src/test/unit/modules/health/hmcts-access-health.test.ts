import request from 'supertest';
import nock from 'nock';

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

import {app} from '../../../../main/app';
import * as launchDarkly from '../../../../main/app/auth/launchdarkly/launchDarklyClient';

describe('HMCTS Access Health Check', () => {
  beforeEach(() => {
    // hmcts-access-migration flag ON so the gated sign-in probe is evaluated
    jest.spyOn(launchDarkly, 'isHmctsAccessMigrationEnabled').mockResolvedValue(true);
  });

  afterEach(() => {
    nock.cleanAll();
    jest.restoreAllMocks();
  });

  it('When the HMCTS Access sign-in page is unreachable, health check should return DOWN', async () => {
    // draft store is UP (mocked above) but the sign-in page probe fails
    nock('http://localhost:9002').get('/health').reply(500).persist();

    await request(app)
      .get('/health')
      .expect((res) => {
        expect(res.status).toBe(503);
        expect(res.body.status).toBe('DOWN');
        expect(res.body['hmcts-access'].status).toBe('DOWN');
      });
  });
});
