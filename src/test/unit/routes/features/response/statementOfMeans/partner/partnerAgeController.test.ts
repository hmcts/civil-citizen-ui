import request from 'supertest';
import {app} from '../../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  CITIZEN_DEPENDANTS_URL,
  CITIZEN_PARTNER_AGE_URL,
  CITIZEN_PARTNER_DISABILITY_URL,
  CITIZEN_PARTNER_PENSION_URL,
} from '../../../../../../../main/routes/urls';
import {VALID_YES_NO_OPTION} from '../../../../../../../main/common/form/validationErrors/errorMessageConstants';

const civilClaimResponseMock = require('../civilClaimResponseMock.json');
const noPartnerAgeMock = require('../noStatementOfMeansMock.json');
const noDisabilityMock = require('../noDisabilityMock.json');
const civilClaimResponse: string = JSON.stringify(civilClaimResponseMock);
const noPartnerAgeCivilClaimResponse: string = JSON.stringify(noPartnerAgeMock);
const mockDraftStore = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(civilClaimResponse)),
};
const mockNoPartnerAgeDraftStore = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(noPartnerAgeCivilClaimResponse)),
};
const mockNoDisabilityDraftStore = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(noDisabilityMock)),
};
jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');

describe('Partner Age', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    test('should return citizen partner age page', async () => {
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .get(CITIZEN_PARTNER_AGE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Is your partner aged 18 or over?');
        });
    });
    test('should show partner age page when haven´t statementOfMeans', async () => {
      app.locals.draftStoreClient = mockNoPartnerAgeDraftStore;
      await request(app)
        .get(CITIZEN_PARTNER_AGE_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });
  });
  describe('on POST', () => {
    test('should redirect page when "no" and defendant disabled = YES', async () => {
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(CITIZEN_PARTNER_AGE_URL)
        .send('option=no')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_PARTNER_DISABILITY_URL);
        });
    });
    test('should return error on incorrect input', async () => {
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(CITIZEN_PARTNER_AGE_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_YES_NO_OPTION);
        });
    });
    test('should redirect page when "yes"', async () => {
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(CITIZEN_PARTNER_AGE_URL)
        .send('option=yes')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_PARTNER_PENSION_URL);
        });
    });
    test('should redirect page when "no" and defendant disabled = NO', async () => {
      app.locals.draftStoreClient = mockNoDisabilityDraftStore;
      await request(app)
        .post(CITIZEN_PARTNER_AGE_URL)
        .send('option=no')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_DEPENDANTS_URL);
        });
    });
  });
});
