import express from 'express';
const request = require('supertest');
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  VALID_HOUSING,
  VALID_OPTION_SELECTION,
} from '../../../../../../main/common/form/validationErrors/errorMessageConstants';
import {CIVIL_SERVICE_CASES_URL} from '../../../../../../main/app/client/civilServiceUrls';
import {DASHBOARD_URL} from '../../../../../../main/routes/urls';

const agent = request.agent(app);

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      get: jest.fn(async () => {
        return '{}';
      }),
      set: jest.fn(async () => {
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

describe('Citizen residence', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');
  const civilServiceUrl: string = config.get('services.civilService.url');

  beforeEach(() => {
    nock(civilServiceUrl)
      .post(CIVIL_SERVICE_CASES_URL)
      .reply(200, {});
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    test('Authenticate Callback', authenticate());
    test('should return residence page', async () => {
      await agent
        .get('/statement-of-means/residence')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Where do you live?');
        });
    });
  });
  describe('on POST', () => {
    test('Authenticate Callback', authenticate());
    test('should redirect when OWN_HOME option selected', async () => {
      await agent
        .post('/statement-of-means/residence')
        .send('type=OWN_HOME')
        .expect((res: express.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DASHBOARD_URL);
        });
    });
    test('should return error when no option selected', async () => {
      await agent
        .post('/statement-of-means/residence')
        .send('type=')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_OPTION_SELECTION);
        });
    });
    test('should return error when type is \'Other\' and housing details not provided', async () => {
      await agent
        .post('/statement-of-means/residence')
        .send('type=OTHER')
        .send('housingDetails=')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_HOUSING);
        });
    });
    test('should redirect when type is \'Other\' and housing details is provided', async () => {
      await agent
        .post('/statement-of-means/residence')
        .send('type=OTHER')
        .send('housingDetails=Palace')
        .expect((res: express.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DASHBOARD_URL);
        });
    });
  });
});
