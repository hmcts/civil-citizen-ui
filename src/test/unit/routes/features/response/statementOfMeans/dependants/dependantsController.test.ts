import express from 'express';
const request = require('supertest');
const {app} = require('../../../../../../../main/app');
import nock from 'nock';
import config from 'config';
import {
  ENTER_AT_LEAST_ONE, INTEGER_REQUIRED, NON_NEGATIVE_NUMBER_REQUIRED,
} from '../../../../../../../main/common/form/validationErrors/errorMessageConstants';
import {
  CITIZEN_DEPENDANTS_URL,
  CITIZEN_PARTNER_URL,
} from '../../../../../../../main/routes/urls';
// import {FREE_TEXT_MAX_LENGTH} from '../../../../../../../main/common/form/validators/validationConstraints';

const agent = request.agent(app);
const respondentDependantsUrl = CITIZEN_DEPENDANTS_URL.replace(':id', 'aaa');
const mockDraftResponse = require('../../statementOfMeans/civilClaimResponseMock.json');

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

describe('Citizen dependants', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');

  beforeEach(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    test('Authenticate Callback', authenticate());
    test('should return dependants page', async () => {
      await agent
        .get(respondentDependantsUrl)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Do any children live with you?');
        });
    });
  });
  describe('on POST', () => {
    test('Authenticate Callback', authenticate());
    test('should redirect when Yes option and one field filled in', async () => {
      await agent
        .post(respondentDependantsUrl)
        .send('declared=yes')
        .send('under11=1')
        .expect((res: express.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CITIZEN_PARTNER_URL.replace(':id', 'aaa'));
        });
    });
    test('should show error when Yes option and no number is filled in', async () => {
      await agent
        .post(respondentDependantsUrl)
        .send('declared=yes')
        .send('under11=')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(ENTER_AT_LEAST_ONE);
        });
    });
    test('should show error when Yes option and invalid under11 input', async () => {
      await agent
        .post(respondentDependantsUrl)
        .send('declared=yes')
        .send('under11=-1')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toMatch(NON_NEGATIVE_NUMBER_REQUIRED);
        });
    });
    test('should show error when Yes option and invalid between11and15 input', async () => {
      await agent
        .post(respondentDependantsUrl)
        .send('declared=yes')
        .send('between11and15=-1')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toMatch(NON_NEGATIVE_NUMBER_REQUIRED);
        });
    });
    test('should show error when Yes option and invalid between16and19 input', async () => {
      await agent
        .post(respondentDependantsUrl)
        .send('declared=yes')
        .send('between16and19=1.5')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toMatch(INTEGER_REQUIRED);
        });
    });
  });
});
