import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {ORDER_JUDGE_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {isGaForLipsEnabled} from 'app/auth/launchdarkly/launchDarklyClient';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/services/features/claim/details/claimDetailsService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../../main/routes/guards/generalAplicationGuard',() => ({
  isGAForLiPEnabled: jest.fn((req, res, next) => {
    next();
  }),
}));

describe('General Application - Application type', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    (isGaForLipsEnabled as jest.Mock).mockResolvedValue(true);
  });

  describe('on GET', () => {
    it('should return page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;

      await request(app)
        .get(ORDER_JUDGE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.TITLE'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(ORDER_JUDGE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should send the value and redirect', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(ORDER_JUDGE_URL)
        .type('form')
        .send({text: 'test'})
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should return errors on empty textarea', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(ORDER_JUDGE_URL)
        .type('form')
        .send({text: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.GENERAL_APPLICATION.ENTER_ORDER_JUDGE'));
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(ORDER_JUDGE_URL)
        .type('form')
        .send({text: 'test'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    /**
     * DTSCCI-2852 WAF bypass: POST with Content-Type application/json must be rejected
     * with 415 so the same payload sent as JSON cannot bypass WAF (url-encoded gets 403).
     */
    it('should return 415 when POST sends application/json (form-only route)', async () => {
      await request(app)
        .post(ORDER_JUDGE_URL)
        .set('Content-Type', 'application/json')
        .send({text: '<b>test</b>', _csrf: 'token'})
        .expect((res) => {
          expect(res.status).toBe(415);
        });
    });
  });
});
