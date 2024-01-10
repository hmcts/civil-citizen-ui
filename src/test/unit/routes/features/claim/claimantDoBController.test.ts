import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {CLAIMANT_DOB_URL, CLAIMANT_PHONE_NUMBER_URL} from 'routes/urls';
import {mockCivilClaim, mockNoStatementOfMeans, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Claimant Date of Birth Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  app.request.cookies = {eligibilityCompleted: true};

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should render date of birth page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).get(CLAIMANT_DOB_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('What is your date of birth?');
    });

    it('should render date of birth page with values', async () => {
      app.locals.draftStoreClient = mockNoStatementOfMeans;
      const res = await request(app).get(CLAIMANT_DOB_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('What is your date of birth?');
    });

    it('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CLAIMANT_DOB_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should render date of birth page if there are form errors', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).post(CLAIMANT_DOB_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('What is your date of birth?');
    });

    it('should redirect to the claimant phone number page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(CLAIMANT_DOB_URL)
        .send({day: 2, month: 3, year: 1980})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(CLAIMANT_PHONE_NUMBER_URL);
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CLAIMANT_DOB_URL)
        .send({day: 4, month: 5, year: 1952})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
