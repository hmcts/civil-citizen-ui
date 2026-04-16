import config from 'config';
import express from 'express';

const request = require('supertest');
const nock = require('nock');

const {app} = require('../../../../main/app');

const agent = request.agent(app);

const redisData: Record<string, string> = {};
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      get: jest.fn(async (key: string) => {
        return redisData[key];
      }),
      set: jest.fn(async (key: string, value: string) => {
        redisData[key] = value;
      }),
      del: jest.fn(async (key: string) => {
        delete redisData[key];
      }),
      expire: jest.fn(async () => {
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

function authenticate() {
  return () =>
    agent.get('/oauth2/callback')
      .query('code=ABC')
      .then((res: express.Response) => {
        expect(res.status).toBe(302);
      });
}

describe('i18n test - Dashboard', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const serviceAuthProviderUrl = config.get<string>('services.serviceAuthProvider.baseUrl');
  const draftStoreUrl = config.get<string>('services.draftStore.legacy.url');
  const civilServiceUrl = config.get<string>('services.civilService.url');
  const data = require('../../../utils/mocks/defendantClaimsMock.json');
  beforeEach(() => {
    nock(civilServiceUrl)
      .get('/cases/defendant/123')
      .query(true)
      .reply(200, {claims: data, totalPages: 1});
    nock(civilServiceUrl)
      .get('/cases/claimant/123')
      .query(true)
      .reply(200, {claims: data, totalPages: 1});
    nock('http://localhost:5000')
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    nock(serviceAuthProviderUrl)
      .post('/lease')
      .reply(200, {});
    nock(draftStoreUrl)
      .get('/drafts')
      .reply(200, {});
  });

  describe('on GET', () => {
    it('Authenticate Callback', authenticate());

    it('should return English dashboard page, when no lang param', async () => {
      await agent
        .get('/dashboard')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Claims made against you');
        });
    });
    it('should return English dashboard page, when lang param is en', async () => {
      await agent
        .get('/dashboard/?lang=en')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Claims made against you');
        });
    });
    it('should return Welsh dashboard page, when lang param is cy', async () => {
      await agent
        .get('/dashboard/?lang=cy')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Hawliadau a wnaed yn eich erbyn');
        });
    });
  });
});
