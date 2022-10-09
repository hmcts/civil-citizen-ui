import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  MEDIATION_DISAGREEMENT_URL,
  DONT_WANT_FREE_MEDIATION_URL,
  CAN_WE_USE_URL,
  CAN_WE_USE_COMPANY_URL,
} from '../../../../../main/routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {mockCivilClaim, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {PartyType} from '../../../../../main/common/models/partyType';
import {YesNo} from '../../../../../main/common/form/models/yesNo';

const applicantTypeMock = require('./applicantTypeMock.json');

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Mediation Disagreement', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return mediation disagreement page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(MEDIATION_DISAGREEMENT_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.MEDIATION_DISAGREEMENT);
        });
    });
    it('should return mediation disagreement page when mediation has mediationDisagreement', async () => {
      applicantTypeMock.case_data.mediation.mediationDisagreement = {option: YesNo.YES};
      const mediationMock: string = JSON.stringify(applicantTypeMock);
      app.locals.draftStoreClient = {
        set: jest.fn(() => Promise.resolve({})),
        get: jest.fn(() => Promise.resolve(mediationMock)),
      };
      await request(app)
        .get(MEDIATION_DISAGREEMENT_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.MEDIATION_DISAGREEMENT);
        });
    });
    it('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(MEDIATION_DISAGREEMENT_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect page when NO', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(MEDIATION_DISAGREEMENT_URL)
        .send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(DONT_WANT_FREE_MEDIATION_URL);
        });
    });
    it('should redirect page when YES and applicant type is INDIVIDUAL', async () => {
      applicantTypeMock.case_data.respondent1.type = PartyType.INDIVIDUAL;
      const individualTypeMock: string = JSON.stringify(applicantTypeMock);
      app.locals.draftStoreClient = {
        set: jest.fn(() => Promise.resolve({})),
        get: jest.fn(() => Promise.resolve(individualTypeMock)),
      };
      await request(app)
        .post(MEDIATION_DISAGREEMENT_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CAN_WE_USE_URL);
        });
    });
    it('should redirect page when YES and applicant type is SOLE TRADER', async () => {
      applicantTypeMock.case_data.respondent1.type = PartyType.SOLE_TRADER;
      const soleTraderTypeMock: string = JSON.stringify(applicantTypeMock);
      app.locals.draftStoreClient = {
        set: jest.fn(() => Promise.resolve({})),
        get: jest.fn(() => Promise.resolve(soleTraderTypeMock)),
      };
      await request(app)
        .post(MEDIATION_DISAGREEMENT_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CAN_WE_USE_URL);
        });
    });
    it('should redirect page when YES and applicant type is ORGANISATION', async () => {
      applicantTypeMock.case_data.respondent1.type = PartyType.ORGANISATION;
      const organisationTypeMock: string = JSON.stringify(applicantTypeMock);
      app.locals.draftStoreClient = {
        set: jest.fn(() => Promise.resolve({})),
        get: jest.fn(() => Promise.resolve(organisationTypeMock)),
      };
      await request(app)
        .post(MEDIATION_DISAGREEMENT_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CAN_WE_USE_COMPANY_URL);
        });
    });
    it('should redirect page when YES and applicant type is COMPANY', async () => {
      applicantTypeMock.case_data.respondent1.type = PartyType.COMPANY;
      const companyTypeMock: string = JSON.stringify(applicantTypeMock);
      app.locals.draftStoreClient = {
        set: jest.fn(() => Promise.resolve({})),
        get: jest.fn(() => Promise.resolve(companyTypeMock)),
      };
      await request(app)
        .post(MEDIATION_DISAGREEMENT_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CAN_WE_USE_COMPANY_URL);
        });
    });
    it('should return error on incorrect input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(MEDIATION_DISAGREEMENT_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Choose option: Yes or No');
        });
    });
    it('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(MEDIATION_DISAGREEMENT_URL)
        .send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
