import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {CLAIM_REASON_URL, CLAIM_TIMELINE_URL} from 'routes/urls';
import {
  mockCivilClaim,
  mockCivilClaimUndefined,
  mockNoStatementOfMeans,
  mockRedisFailure,
} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Claim Details - Reason', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return reason page empty when dont have information on redis ', async () => {
      app.locals.draftStoreClient = mockNoStatementOfMeans;
      await request(app)
        .get(CLAIM_REASON_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.REASON_EXPLANATION);
        });
    });
    it('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CLAIM_REASON_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should create a new claim if redis gives undefined', async () => {
      app.locals.draftStoreClient = mockCivilClaimUndefined;
      await request(app)
        .post(CLAIM_REASON_URL)
        .send({text: 'reason'})
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    it('should return errors on no input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIM_REASON_URL)
        .send({text: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.REASON_REQUIRED'));
        });
    });
    it('should accept a valid input', async () => {
      await request(app)
        .post(CLAIM_REASON_URL)
        .send({text: 'reason'})
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    it('should redirect to timeline page', async () => {
      await request(app)
        .post(CLAIM_REASON_URL)
        .send({text: 'reason'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(`Redirecting to ${CLAIM_TIMELINE_URL}`);
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CLAIM_REASON_URL)
        .send({text: 'reason'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
