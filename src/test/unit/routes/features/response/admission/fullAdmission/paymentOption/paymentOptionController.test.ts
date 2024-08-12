import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../../../main/app';
import {
  CITIZEN_PAYMENT_DATE_URL,
  CITIZEN_PAYMENT_OPTION_URL,
  RESPONSE_TASK_LIST_URL,
} from '../../../../../../../../main/routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../../../utils/errorMessageTestConstants';
import * as draftStoreService from '../../../../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import * as utilService from 'modules/utilityService';
import * as paymentOptionService from '../../../../../../../../main/services/features/response/admission/paymentOptionService';

jest.mock('../../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../../main/modules/draft-store/draftStoreService');

describe('Payment Option Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on Get', () => {
    it('should return payment option page successfully', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      jest.spyOn(utilService, 'getClaimById').mockResolvedValue(new Claim());
      await request(app)
        .get(CITIZEN_PAYMENT_OPTION_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('When do you want to pay?');
        });
    });

    it('should return status 500 when there is an error', async () => {
      jest.spyOn(utilService, 'getClaimById').mockRejectedValueOnce(mockRedisFailure);
      await request(app)
        .get(CITIZEN_PAYMENT_OPTION_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on Post', () => {
    it('should validate when option is not selected', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_PAYMENT_OPTION_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_PAYMENT_OPTION);
        });
    });
    it('should redirect to claim list when immediately option is selected', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_PAYMENT_OPTION_URL)
        .send('paymentType=IMMEDIATELY')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });
    it('should redirect to claim list when instalments option is selected', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_PAYMENT_OPTION_URL)
        .send('paymentType=IMMEDIATELY')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });
    it('should redirect to claim list when instalments option is selected', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_PAYMENT_OPTION_URL)
        .send('paymentType=BY_SET_DATE')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_PAYMENT_DATE_URL);
        });
    });
    it('should return 500 status when there is error', async () => {
      jest.spyOn(paymentOptionService, 'savePaymentOptionData').mockRejectedValueOnce(mockRedisFailure);
      await request(app)
        .post(CITIZEN_PAYMENT_OPTION_URL)
        .send({paymentType:'BY_SET_DATE'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
