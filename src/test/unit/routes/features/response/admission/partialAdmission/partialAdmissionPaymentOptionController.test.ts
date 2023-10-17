import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../../main/app';
import {
  CITIZEN_PA_PAYMENT_DATE_URL,
  CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL,
  RESPONSE_TASK_LIST_URL,
} from '../../../../../../../main/routes/urls';
import {
  mockRedisWithPaymentAmount,
  mockRedisFullAdmission,
  mockRedisWithoutAdmittedPaymentAmount,
  mockRedisFailure,
} from '../../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import civilClaimResponseWithAdmittedPaymentAmountMock
  from '../../../../../../utils/mocks/civilClaimResponseWithAdmittedPaymentAmountMock.json';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../../../main/modules/oidc');

describe('Part Admit - Payment Option Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });
  describe('on Get', () => {
    it('should return payment option page successfully', async () => {
      app.locals.draftStoreClient = mockRedisWithPaymentAmount;
      const mockAdmittedPaymentAmount = civilClaimResponseWithAdmittedPaymentAmountMock.case_data.partialAdmission.howMuchDoYouOwe.amount.toFixed(2);
      await request(app)
        .get(CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(`When do you want to pay the £${mockAdmittedPaymentAmount}?`);
        });
    });
    it('should redirect to claim task list when response type is not part admission', async () => {
      app.locals.draftStoreClient = mockRedisFullAdmission;
      await request(app)
        .get(CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });
    it('should redirect to claim task list when admitted payment amount is not provided', async () => {
      app.locals.draftStoreClient = mockRedisWithoutAdmittedPaymentAmount;
      await request(app)
        .get(CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });
    it('should return status 500 when there is an error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
  describe('on Post', () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockRedisWithPaymentAmount;
    });
    it('should validate when option is not selected', async () => {
      await request(app)
        .post(CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_PAYMENT_OPTION);
        });
    });
    it('should redirect to claim task list when immediately option is selected', async () => {
      await request(app)
        .post(CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL)
        .send('paymentType=IMMEDIATELY')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });
    it('should redirect to claim task list when instalments option is selected', async () => {
      await request(app)
        .post(CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL)
        .send('paymentType=IMMEDIATELY')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });
    it('should redirect to claim task list when instalments option is selected', async () => {
      await request(app)
        .post(CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL)
        .send('paymentType=BY_SET_DATE')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_PA_PAYMENT_DATE_URL);
        });
    });
    it('should return 500 status when there is error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL)
        .send('paymentType=BY_SET_DATE')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
