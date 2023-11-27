import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {CLAIM_INTEREST_END_DATE_URL, CLAIM_HELP_WITH_FEES_URL} from 'routes/urls';
import {mockCivilClaim, mockNoStatementOfMeans, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {InterestEndDateType} from 'form/models/claimDetails';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Claimant Interest From Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  app.request.cookies = {eligibilityCompleted: true};

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    app.locals.draftStoreClient = mockCivilClaim;
  });

  describe('on GET', () => {
    it('should render interest end page', async () => {
      const res = await request(app).get(CLAIM_INTEREST_END_DATE_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('When do you want to stop claiming interest?');
    });

    it('should render interest end page with values', async () => {
      app.locals.draftStoreClient = mockNoStatementOfMeans;
      const res = await request(app).get(CLAIM_INTEREST_END_DATE_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('When do you want to stop claiming interest?');
    });

    it('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CLAIM_INTEREST_END_DATE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should render interest end page if there are form errors', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).post(CLAIM_INTEREST_END_DATE_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('There was a problem');
    });

    it('should redirect to the help with fees page with until claim submitted option selected', async () => {
      app.locals.draftStoreClient = mockNoStatementOfMeans;
      await request(app).post(CLAIM_INTEREST_END_DATE_URL)
        .send({'option': InterestEndDateType.UNTIL_CLAIM_SUBMIT_DATE})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(CLAIM_HELP_WITH_FEES_URL);
        });
    });

    it('should redirect to the help with fees page with until settled option selected', async () => {
      app.locals.draftStoreClient = mockNoStatementOfMeans;
      await request(app).post(CLAIM_INTEREST_END_DATE_URL)
        .send({'option': InterestEndDateType.UNTIL_SETTLED_OR_JUDGEMENT_MADE})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(CLAIM_HELP_WITH_FEES_URL);
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CLAIM_INTEREST_END_DATE_URL)
        .send({'option': InterestEndDateType.UNTIL_CLAIM_SUBMIT_DATE})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
