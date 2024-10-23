import {
  CLAIM_FEE_MAKE_PAYMENT_AGAIN_URL,
} from 'routes/urls';

import nock from 'nock';
import request from 'supertest';
import config from 'config';
import {app} from '../../../../../../main/app';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import * as makePaymentAgainService from 'services/features/claim/payment/claimFeeMakePaymentAgainService';
import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {mockCivilClaim} from '../../../../../utils/mockDraftStore';
import {Session} from 'express-session';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/paymentSessionStoreService', () => ({
  saveUserId: jest.fn(),
}));
jest.mock('../../../../../../main/modules/draft-store/draftStoreService', () => ({
  getCaseDataFromStore: jest.fn(),
  generateRedisKey: jest.fn(),
  saveDraftClaim: jest.fn(),
}));
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

describe('Claim Fee - Make Payment Again', () => {
  const idamServiceUrl: string = config.get('services.idam.url');
  const citizenRoleToken: string = config.get('citizenRoleToken');

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should redirect user to govPay Payment Page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      app.request['session'] = {user: {id: 'jfkdljfd'}} as unknown as Session;
      jest.spyOn(makePaymentAgainService,'getRedirectUrl').mockResolvedValueOnce('12354876');
      jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
      jest.spyOn(draftStoreService,'saveDraftClaim');

      await request(app)
        .get(CLAIM_FEE_MAKE_PAYMENT_AGAIN_URL)
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should return 500 error page for any service error', async () => {
      jest.spyOn(makePaymentAgainService,'getRedirectUrl').mockRejectedValueOnce(TestMessages.SOMETHING_WENT_WRONG);
      await request(app)
        .get(CLAIM_FEE_MAKE_PAYMENT_AGAIN_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
