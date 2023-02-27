import config from 'config';
import express from 'express';

const request = require('supertest');
const nock = require('nock');

const {app} = require('../../../../main/app');

const agent = request.agent(app);

const en = require('../../../../main/modules/i18n/locales/en.json');
const cy = require('../../../../main/modules/i18n/locales/cy.json');

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      set: jest.fn(async () => {
        return;
      }),
      on: jest.fn(async () => {
        return;
      }),
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
      .reply(200, {data: data});
    nock(civilServiceUrl)
      .get('/cases/claimant/123')
      .reply(200, {data: data});
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
          expect(res.text).toContain('Smialc edam tsniaga uoy');
        });
    });
  });

  const getKeys = (obj: string[], prefix = ''): string[] =>
    Object.keys(obj).reduce((res: string[], el: string) => {
      if(Array.isArray(obj[el])) {
        return res;
      } else if( typeof obj[el] === 'object' && obj[el] !== null ) {
        return [...res, ...getKeys(obj[el], prefix + el + '.')];
      }
      return [...res, prefix + el];
    }, []);

  describe('Compare language file structure', () => {
    it('should have the same top-level sections in the language files', () => {
      const allEnKeys = getKeys(en);
      const allCyKeys = getKeys(cy);
      expect(allEnKeys.length).toEqual(allCyKeys.length);
      expect(allEnKeys).toEqual(allCyKeys);
    });
  });
});
