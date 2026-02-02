import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  DQ_EXPERT_DETAILS_URL,
  DQ_EXPERT_GUIDANCE_URL,
  DQ_EXPERT_REPORT_DETAILS_URL,
} from 'routes/urls';
import {
  mockCivilClaim,
  mockCivilClaimDefendantCaseProgression,
  mockRedisFailure,
} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Expert Report Details Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return Have you already got a report written by an expert', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(DQ_EXPERT_REPORT_DETAILS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Have you already got a report written by an expert?');
      });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(DQ_EXPERT_REPORT_DETAILS_URL)
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

    it('should return page with error message on empty post', async () => {
      await request(app).post(DQ_EXPERT_REPORT_DETAILS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.EXPERT_REPORT_DETAILS_REQUIRED);
      });
    });

    it('should redirect to expert details if option yes is selected - claimant', async () => {
      await request(app).post(DQ_EXPERT_REPORT_DETAILS_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_EXPERT_DETAILS_URL);
        });
    });

    it('should redirect to expert details if option yes is selected - defendant', async () => {
      app.locals.draftStoreClient = mockCivilClaimDefendantCaseProgression;
      await request(app).post(DQ_EXPERT_REPORT_DETAILS_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_EXPERT_DETAILS_URL);
        });
    });

    it('should redirect to expert guidance page if option no is selected', async () => {
      await request(app).post(DQ_EXPERT_REPORT_DETAILS_URL).send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_EXPERT_GUIDANCE_URL);
        });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(DQ_EXPERT_REPORT_DETAILS_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
