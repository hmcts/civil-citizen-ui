import {app} from '../../../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {CITIZEN_COURT_ORDERS_URL, CITIZEN_UNEMPLOYED_URL} from '../../../../../../../main/routes/urls';
import {
  DETAILS_REQUIRED,
  SELECT_AN_OPTION,
  VALID_BETWEEN_NUMBERS_0_11,
  VALID_BETWEEN_NUMBERS_0_80,
  VALID_INTEGER,
} from '../../../../../../../main/common/form/validationErrors/errorMessageConstants';
import {
  mockCivilClaim,
  mockCivilClaimOptionNo,
  mockCivilClaimUndefined,
  mockNoStatementOfMeans,
  mockCivilClaimUnemploymentRetired,
  mockCivilClaimUnemploymentOther,
  mockRedisFailure,
} from '../../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');

describe('Unemployment', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  describe('on Get', () => {
    it('should return unemployment page successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(CITIZEN_UNEMPLOYED_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Are you unemployed or retired?');
        });
    });
    it('should return unemployment page successfully without statementofmeans', async () => {
      app.locals.draftStoreClient = mockNoStatementOfMeans;
      await request(app).get(CITIZEN_UNEMPLOYED_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Are you unemployed or retired?');
        });
    });
    it('should return unemployment page successfully without claim', async () => {
      app.locals.draftStoreClient = mockCivilClaimUndefined;
      await request(app).get(CITIZEN_UNEMPLOYED_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Are you unemployed or retired?');
        });
    });
    it('should return unemployment page successfully without unemployment', async () => {
      app.locals.draftStoreClient = mockCivilClaimOptionNo;
      await request(app).get(CITIZEN_UNEMPLOYED_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Are you unemployed or retired?');
        });
    });
    it('should return unemployment page successfully when retired', async () => {
      app.locals.draftStoreClient = mockCivilClaimUnemploymentRetired;
      await request(app).get(CITIZEN_UNEMPLOYED_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Are you unemployed or retired?');
        });
    });
    it('should return unemployment page successfully when other', async () => {
      app.locals.draftStoreClient = mockCivilClaimUnemploymentOther;
      await request(app).get(CITIZEN_UNEMPLOYED_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Are you unemployed or retired?');
        });
    });
    it('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CITIZEN_UNEMPLOYED_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
  describe('on Post', () => {
    it('should return error message when any option is selected', async () => {
      await request(app).post(CITIZEN_UNEMPLOYED_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(SELECT_AN_OPTION);
          expect(res.text).toContain('govuk-error-message');
        });
    });

    it('should redirect to court page option Retired is selected and without statementofmeans', async () => {
      app.locals.draftStoreClient = mockNoStatementOfMeans;
      await request(app).post(CITIZEN_UNEMPLOYED_URL)
        .send({option: 'Retired'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_COURT_ORDERS_URL);
        });
    });
    it('should redirect to court page option Retired is selected', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(CITIZEN_UNEMPLOYED_URL)
        .send({option: 'Retired'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_COURT_ORDERS_URL);
        });
    });
    it('should redirect to court page option Retired is selected without claim data in redis', async () => {
      app.locals.draftStoreClient = mockCivilClaimUndefined;
      await request(app).post(CITIZEN_UNEMPLOYED_URL)
        .send({option: 'Retired'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_COURT_ORDERS_URL);
        });
    });
    it('should return error message when option Other is selected and detail is empty', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(CITIZEN_UNEMPLOYED_URL)
        .send({option: 'Other'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(DETAILS_REQUIRED);
          expect(res.text).toContain('govuk-error-message');
        });
    });
    it('should return error message when option Other is selected and detail is has details', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(CITIZEN_UNEMPLOYED_URL)
        .send({option: 'Other', details: 'Test'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_COURT_ORDERS_URL);
        });
    });
    it('should return error message when option Unemployed is selected and has year and month', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(CITIZEN_UNEMPLOYED_URL)
        .send({option: 'Unemployed', years: '5', months: '1'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_COURT_ORDERS_URL);
        });
    });
    it('should return error message when option Unemployed is selected and year and month are empty', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(CITIZEN_UNEMPLOYED_URL)
        .send({option: 'Unemployed'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_INTEGER);
          expect(res.text).toContain(VALID_INTEGER);
          expect(res.text).toContain('govuk-error-message');
        });
    });
    it('should return error message when option Unemployed is selected and year is greater than 80', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(CITIZEN_UNEMPLOYED_URL)
        .send({option: 'Unemployed', years: '150', months: '1'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_BETWEEN_NUMBERS_0_80);
          expect(res.text).toContain('govuk-error-message');
        });
    });
    it('should return error message when option Unemployed is selected and month is greater than 11', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(CITIZEN_UNEMPLOYED_URL)
        .send({option: 'Unemployed', years: '1', months: '12'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_BETWEEN_NUMBERS_0_11);
          expect(res.text).toContain('govuk-error-message');
        });
    });

    it('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CITIZEN_UNEMPLOYED_URL)
        .send({option: 'Unemployed', years: '1', months: '11'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
