import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  CCJ_PAID_AMOUNT_SUMMARY_URL,
  CCJ_PAYMENT_OPTIONS_URL,
} from 'routes/urls';
import {
  mockCivilClaimClaimantIntention,
  mockRedisFailure,
} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

const civilServiceUrl = config.get<string>('services.civilService.url');

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/common/utils/dateUtils');

describe('Judgment Amount Summary', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    nock(civilServiceUrl)
      .post('/fees/claim/calculate-interest')
      .reply(200, '0');
    nock(civilServiceUrl)
      .post('/fees/claim/interest')
      .reply(200, '0');
  });

  describe('on GET', () => {
    it('should return judgement summary page - from request CCJ', async () => {
      app.locals.draftStoreClient = mockCivilClaimClaimantIntention;

      const res = await request(app)
        .get(CCJ_PAID_AMOUNT_SUMMARY_URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain('Judgment amount');
    });

    it('should return http 500 when has error in the get method - from request CCJ', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CCJ_PAID_AMOUNT_SUMMARY_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect to ccj payment options - from request CCJ', async () => {
      app.locals.draftStoreClient = mockCivilClaimClaimantIntention;
      const res = await request(app).post(CCJ_PAID_AMOUNT_SUMMARY_URL).send();
      expect(res.status).toBe(302);
      expect(res.get('location')).toBe(CCJ_PAYMENT_OPTIONS_URL);
    });
  });

});
