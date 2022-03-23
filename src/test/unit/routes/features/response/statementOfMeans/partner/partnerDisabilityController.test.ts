import request from 'supertest';
import {app} from '../../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  CITIZEN_DEPENDANTS_URL,
  CITIZEN_PARTNER_DISABILITY_URL,
  CITIZEN_PARTNER_SEVERE_DISABILITY_URL,
} from '../../../../../../../main/routes/urls';
import {VALID_YES_NO_OPTION} from '../../../../../../../main/common/form/validationErrors/errorMessageConstants';

const civilClaimResponseMock = require('../civilClaimResponseMock.json');
const noPartnerMock = require('../noStatementOfMeansMock.json');
const civilClaimResponse: string = JSON.stringify(civilClaimResponseMock);
const noPartnerCivilClaimResponse: string = JSON.stringify(noPartnerMock);
const mockDraftStore = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(civilClaimResponse)),
};
const mockNoPartnerDraftStore = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(noPartnerCivilClaimResponse)),
};
jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');

describe('Partner disability', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    test('should return citizen disability partner page', async () => {
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .get(CITIZEN_PARTNER_DISABILITY_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Is your partner disabled?');
        });
    });
    test('should show partner page when haven´t statementOfMeans', async () => {
      app.locals.draftStoreClient = mockNoPartnerDraftStore;
      await request(app)
        .get(CITIZEN_PARTNER_DISABILITY_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });
  });
  describe('on POST', () => {
    test('should redirect page when "no"', async () => {
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(CITIZEN_PARTNER_DISABILITY_URL)
        .send('option=no')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_DEPENDANTS_URL);
        });
    });
    test('should redirect page when "no" and haven´t statementOfMeans', async () => {
      app.locals.draftStoreClient = mockNoPartnerDraftStore;
      await request(app)
        .post(CITIZEN_PARTNER_DISABILITY_URL)
        .send('option=no')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_DEPENDANTS_URL);
        });
    });
    test('should return error on incorrect input', async () => {
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(CITIZEN_PARTNER_DISABILITY_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_YES_NO_OPTION);
        });
    });
    test('should redirect page when "yes"', async () => {
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(CITIZEN_PARTNER_DISABILITY_URL)
        .send('option=yes')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_PARTNER_SEVERE_DISABILITY_URL);
        });
    });
  });
});
