import {
  HEARING_FEE_PAYMENT_CONFIRMATION_URL, HEARING_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID,
} from 'routes/urls';

import nock from 'nock';
import request from 'supertest';
import config from 'config';
import {app} from '../../../../../../main/app';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import * as paymentConfirmationService from 'services/features/caseProgression/hearingFee/paymentConfirmationService';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store/paymentSessionStoreService', () => ({
  saveUserId: jest.fn(),
}));
jest.mock('../../../../../../main/modules/draft-store/draftStoreService', () => ({
  getCaseDataFromStore: jest.fn(),
  generateRedisKey: jest.fn(),
  saveDraftClaim: jest.fn(),
  deleteDraftClaimFromStore: jest.fn(),
}));

describe('Hearing Fees - Payment Status', () => {
  const idamServiceUrl: string = config.get('services.idam.url');
  const citizenRoleToken: string = config.get('citizenRoleToken');

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should redirect user to success/failure page', async () => {
      jest.spyOn(paymentConfirmationService,'getRedirectUrl').mockResolvedValueOnce('12354');
      await request(app)
        .get(HEARING_FEE_PAYMENT_CONFIRMATION_URL)
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should redirect user to success/failure page', async () => {
      jest.spyOn(paymentConfirmationService,'getRedirectUrl').mockResolvedValueOnce('12354');
      await request(app)
        .get(HEARING_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID)
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should return 500 error page for any service error', async () => {
      jest.spyOn(paymentConfirmationService,'getRedirectUrl').mockRejectedValueOnce(TestMessages.SOMETHING_WENT_WRONG);
      await request(app)
        .get(HEARING_FEE_PAYMENT_CONFIRMATION_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

});
