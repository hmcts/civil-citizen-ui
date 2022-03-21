import request from 'supertest';
import {app} from '../../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  CITIZEN_DEPENDANTS_URL,
  CITIZEN_PARTNER_DISABILITY_URL,
  CITIZEN_PARTNER_PENSION_URL,
} from '../../../../../../../main/routes/urls';
import {VALID_YES_NO_OPTION} from '../../../../../../../main/common/form/validationErrors/errorMessageConstants';

const civilClaimResponseMock = require('../civilClaimResponseMock.json');
const noPartnerPensionMock = require('../noStatementOfMeansMock.json');
const noDisabilityMock = require('../noDisabilityMock.json');
const civilClaimResponse: string = JSON.stringify(civilClaimResponseMock);
const noPartnerPensionCivilClaimResponse: string = JSON.stringify(noPartnerPensionMock);
const noDisabilityMockCivilClaimResponse: string = JSON.stringify(noDisabilityMock);
const mockDraftStore = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(civilClaimResponse)),
};
const mockNoPartnerPensionDraftStore = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(noPartnerPensionCivilClaimResponse)),
};
const mockNoDisabilityDraftStore = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(noDisabilityMockCivilClaimResponse)),
};
jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');

describe('Partner Pension', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    test('should return citizen partner pension page', async () => {
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .get(CITIZEN_PARTNER_PENSION_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Does your partner receive a pension?');
        });
    });
    test('should show partner pension page when haven´t statementOfMeans', async () => {
      app.locals.draftStoreClient = mockNoPartnerPensionDraftStore;
      await request(app)
        .get(CITIZEN_PARTNER_PENSION_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });
  });
  describe('on POST', () => {
    test('should redirect page when "no" and defendant disabled = yes', async () => {
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(CITIZEN_PARTNER_PENSION_URL)
        .send('partnerPension=no')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_PARTNER_DISABILITY_URL);
        });
    });
    test('should redirect page when "no" and defendant disabled = no', async () => {
      app.locals.draftStoreClient = mockNoDisabilityDraftStore;
      await request(app)
        .post(CITIZEN_PARTNER_PENSION_URL)
        .send('partnerPension=no')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_DEPENDANTS_URL);
        });
    });
    test('should redirect page when "yes" and defendant disabled = no', async () => {
      app.locals.draftStoreClient = mockNoDisabilityDraftStore;
      await request(app)
        .post(CITIZEN_PARTNER_PENSION_URL)
        .send('partnerPension=yes')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_DEPENDANTS_URL);
        });
    });
    test('should redirect page when "yes" and defendant disabled = yes', async () => {
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(CITIZEN_PARTNER_PENSION_URL)
        .send('partnerPension=yes')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_PARTNER_DISABILITY_URL);
        });
    });
    test('should return error on incorrect input', async () => {
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(CITIZEN_PARTNER_PENSION_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_YES_NO_OPTION);
        });
    });
    test('should redirect partner disability page when "no" and haven´t statementOfMeans', async () => {
      app.locals.draftStoreClient = mockNoPartnerPensionDraftStore;
      await request(app)
        .post(CITIZEN_PARTNER_PENSION_URL)
        .send('partnerPension=no')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_PARTNER_DISABILITY_URL);
        });
    });
  });
});
