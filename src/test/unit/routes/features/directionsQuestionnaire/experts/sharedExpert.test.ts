import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../app';
import {DQ_EXPERT_DETAILS_URL, DQ_SHARE_AN_EXPERT_URL} from 'routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('modules/oidc');
jest.mock('modules/draft-store');

describe('Shared Expert Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return shared expert page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(DQ_SHARE_AN_EXPERT_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you want to share an expert with the claimant?');
      });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(DQ_SHARE_AN_EXPERT_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    beforeAll(() => {
      app.locals.draftStoreClient = mockCivilClaim;
    });

    it('should return shared expert page on empty post', async () => {
      await request(app).post(DQ_SHARE_AN_EXPERT_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_SHARED_EXPERT);
      });
    });

    it('should redirect to the expert details page if option yes is selected', async () => {
      await request(app).post(DQ_SHARE_AN_EXPERT_URL).send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_EXPERT_DETAILS_URL);
        });
    });

    it('should redirect to the expert details page if option no is selected', async () => {
      await request(app).post(DQ_SHARE_AN_EXPERT_URL).send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_EXPERT_DETAILS_URL);
        });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(DQ_SHARE_AN_EXPERT_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
