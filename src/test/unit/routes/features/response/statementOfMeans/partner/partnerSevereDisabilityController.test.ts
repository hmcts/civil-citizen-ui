import request from 'supertest';
import { app } from '../../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import { CITIZEN_DEPENDANTS_URL, CITIZEN_PARTNER_SEVERE_DISABILITY_URL, RESPONSE_TASK_LIST_URL } from '../../../../../../../main/routes/urls';
import { TestMessages } from '../../../../../../utils/errorMessageTestConstants';
import {mockCivilClaimUndefined, mockRedisFailure, mockResponseFullAdmitPayBySetDate} from '../../../../../../utils/mockDraftStore';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../../../main/modules/oidc');

describe('Partner severe disability', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on GET', () => {
    it('should return citizen partner severe disability page', async () => {
      app.locals.draftStoreClient = mockResponseFullAdmitPayBySetDate;
      await request(app)
        .get(CITIZEN_PARTNER_SEVERE_DISABILITY_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.IS_YOUR_PARTNER_SEVERELY_DISABLED);
        });
    });
    it('should show partner page when haven´t statementOfMeans', async () => {
      app.locals.draftStoreClient = mockResponseFullAdmitPayBySetDate;
      await request(app)
        .get(CITIZEN_PARTNER_SEVERE_DISABILITY_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });
    it('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CITIZEN_PARTNER_SEVERE_DISABILITY_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
  describe('on POST', () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockResponseFullAdmitPayBySetDate;
    });
    it('should redirect to response task list if redis claim is undefined', async () => {
      app.locals.draftStoreClient = mockCivilClaimUndefined;
      await request(app)
        .post(CITIZEN_PARTNER_SEVERE_DISABILITY_URL)
        .send('option=no')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });
    it('should redirect page when "no"', async () => {
      await request(app)
        .post(CITIZEN_PARTNER_SEVERE_DISABILITY_URL)
        .send('option=no')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_DEPENDANTS_URL);
        });
    });
    it('should return error on incorrect input', async () => {
      await request(app)
        .post(CITIZEN_PARTNER_SEVERE_DISABILITY_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_YES_NO_OPTION);
        });
    });
    it('should redirect page when "yes"', async () => {
      await request(app)
        .post(CITIZEN_PARTNER_SEVERE_DISABILITY_URL)
        .send('option=yes')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_DEPENDANTS_URL);
        });
    });
    it('should redirect page when "no" and haven´t statementOfMeans', async () => {
      await request(app)
        .post(CITIZEN_PARTNER_SEVERE_DISABILITY_URL)
        .send('option=no')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_DEPENDANTS_URL);
        });
    });
    it('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CITIZEN_PARTNER_SEVERE_DISABILITY_URL)
        .send('option=no')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
