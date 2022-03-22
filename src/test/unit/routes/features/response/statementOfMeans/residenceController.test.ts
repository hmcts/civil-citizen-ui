import express from 'express';
const request = require('supertest');
const {app} = require('../../../../../../main/app');
import nock from 'nock';
import config from 'config';
import {
  VALID_HOUSING,
  VALID_OPTION_SELECTION,
  VALID_TEXT_LENGTH,
} from '../../../../../../main/common/form/validationErrors/errorMessageConstants';
import {CIVIL_SERVICE_CASES_URL} from '../../../../../../main/app/client/civilServiceUrls';
import {CITIZEN_PARTNER_URL, CITIZEN_RESIDENCE_URL} from '../../../../../../main/routes/urls';
import {FREE_TEXT_MAX_LENGTH} from '../../../../../../main/common/form/validators/validationConstraints';

const agent = request.agent(app);
const tooLongHousingDetails: string = Array(FREE_TEXT_MAX_LENGTH + 2).join('a');
const respondentResidenceUrl = CITIZEN_RESIDENCE_URL.replace(':id', 'aaa');
const mockDraftResponse = require('./civilClaimResponseMock.json');

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      get: jest.fn(async () => {
        return JSON.stringify(mockDraftResponse);
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
        .get(respondentResidenceUrl)
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
        .post(respondentResidenceUrl)
        .send('type=OWN_HOME')
        .expect((res: express.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CITIZEN_PARTNER_URL.replace(':id', 'aaa'));
        });
    });
    test('should return error when no option selected', async () => {
      await agent
        .post(respondentResidenceUrl)
        .send('type=')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_OPTION_SELECTION);
        });
    });
    test('should return error when type is \'Other\' and housing details not provided', async () => {
      await agent
        .post(respondentResidenceUrl)
        .send('type=OTHER')
        .send('housingDetails=')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_HOUSING);
        });
    });
    test('should redirect when type is \'Other\' and housing details are provided', async () => {
      await agent
        .post(respondentResidenceUrl)
        .send('type=OTHER')
        .send('housingDetails=Palace')
        .expect((res: express.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CITIZEN_PARTNER_URL.replace(':id', 'aaa'));
        });
    });
    test('should return error when type is \'Other\' and housing details are too long', async () => {
      await agent
        .post(respondentResidenceUrl)
        .send('type=OTHER')
        .send(`housingDetails=${tooLongHousingDetails}`)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_TEXT_LENGTH);
        });
    });
  });
});
