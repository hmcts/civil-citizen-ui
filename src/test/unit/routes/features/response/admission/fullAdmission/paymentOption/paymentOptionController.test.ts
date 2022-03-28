import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../../../main/app';
import {CITIZEN_PAYMENT_OPTION_URL} from '../../../../../../../../main/routes/urls';
import * as paymentOptionService
  from '../../../../../../../../main/modules/admission/fullAdmission/paymentOption/paymentOptionService';
import {REDIS_ERROR_MESSAGE} from '../../../../../../../../main/common/form/validationErrors/errorMessageConstants';

jest.mock('../../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../../main/modules/draft-store/draftStoreService');
const mockGetCaseData = paymentOptionService.getPaymentOptionForm as jest.Mock;
describe('Payment Option Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  describe('on Get', () => {
    test('should return payment option page successfully', async () => {
      await request(app)
        .get(CITIZEN_PAYMENT_OPTION_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('When do you want to pay?');
        });
    });
    test('should return status 500 when there is an error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(REDIS_ERROR_MESSAGE);
      });
      await request(app)
        .get(CITIZEN_PAYMENT_OPTION_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toEqual({error: REDIS_ERROR_MESSAGE});
        });
    });
  });
});
