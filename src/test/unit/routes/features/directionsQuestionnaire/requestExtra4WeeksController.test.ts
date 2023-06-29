import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {DQ_REQUEST_EXTRA_4WEEKS_URL, DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL} from '../../../../../main/routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Request extra 4 weeks to Settle Claim Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return request extra 4 weeks to settle the claim page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(DQ_REQUEST_EXTRA_4WEEKS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you want an extra 4 weeks to try to settle the claim?');
      });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(DQ_REQUEST_EXTRA_4WEEKS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockCivilClaim;
    });

    it('should return request extra 4 weeks to settle the claim page on empty post', async () => {
      await request(app).post(DQ_REQUEST_EXTRA_4WEEKS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_REQUEST_EXTRA_4_WEEKS);
      });
    });

    it('should redirect to consider claimant documents page if option yes is selected', async () => {
      await request(app).post(DQ_REQUEST_EXTRA_4WEEKS_URL).send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL);
        });
    });

    it('should redirect to consider claimant documents page page if option no is selected', async () => {
      await request(app).post(DQ_REQUEST_EXTRA_4WEEKS_URL).send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL);
        });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(DQ_REQUEST_EXTRA_4WEEKS_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
