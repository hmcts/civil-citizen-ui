import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {
  BREATHING_SPACE_RESPITE_LIFTED_URL,
  BREATHING_SPACE_RESPITE_LIFTED_CHECK_ANSWER_URL,
} from '../../../../../main/routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Claimant Response - Debt Respite Lifted Date Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return debt respite lift date page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(BREATHING_SPACE_RESPITE_LIFTED_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.BREATHING_SPACE_DEBT_RESPITE_LIFT.TITLE'));
        });
    });
    it('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(BREATHING_SPACE_RESPITE_LIFTED_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should move to next page if no input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(BREATHING_SPACE_RESPITE_LIFTED_URL)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(`Redirecting to ${BREATHING_SPACE_RESPITE_LIFTED_CHECK_ANSWER_URL}`);
        });
    });
    it('should return errors date in the future', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(BREATHING_SPACE_RESPITE_LIFTED_URL)
        .send('year=2500')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_DATE_LIFT_NOT_AFTER_TODAY'));
        });
    });
    it('should accept a valid input', async () => {
      await request(app)
        .post(BREATHING_SPACE_RESPITE_LIFTED_URL)
        .send('year=2000')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(`Redirecting to ${BREATHING_SPACE_RESPITE_LIFTED_CHECK_ANSWER_URL}`);
        });
    });
    it('should return http 500 when has error in the post method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(BREATHING_SPACE_RESPITE_LIFTED_URL)
        .send('year=1990')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
