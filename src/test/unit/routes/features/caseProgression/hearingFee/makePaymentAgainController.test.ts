import {
  HEARING_FEE_MAKE_PAYMENT_AGAIN_URL,
} from 'routes/urls';

import nock from 'nock';
import request from 'supertest';
import config from 'config';
import {app} from '../../../../../../main/app';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import * as makePaymentAgainService from 'services/features/caseProgression/hearingFee/makePaymentAgainService';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
describe('Hearing Fees - Make Payment Again', () => {
  const idamServiceUrl: string = config.get('services.idam.url');
  const citizenRoleToken: string = config.get('citizenRoleToken');

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should redirect user to govPay Payment Page', async () => {
      jest.spyOn(makePaymentAgainService,'getRedirectUrl').mockResolvedValueOnce('12354');
      await request(app)
        .get(HEARING_FEE_MAKE_PAYMENT_AGAIN_URL)
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should return 500 error page for any service error', async () => {
      jest.spyOn(makePaymentAgainService,'getRedirectUrl').mockRejectedValueOnce(TestMessages.SOMETHING_WENT_WRONG);
      await request(app)
        .get(HEARING_FEE_MAKE_PAYMENT_AGAIN_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

});
