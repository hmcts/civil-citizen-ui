import {app} from '../../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import request from 'supertest';
import {CITIZEN_PA_PAYMENT_DATE_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {
  civilClaimResponseMock,
} from '../../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {PaymentDateService} from 'services/features/response/admission/fullAdmission/paymentOption/paymentDateService';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService',);

describe('Payment date', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on Exception', () => {
    it('should return http 500 when has error in the get method', async () => {
      (getCaseDataFromStore as jest.Mock).mockRejectedValueOnce(new Error(TestMessages.REDIS_FAILURE));
      await request(app)
        .get(CITIZEN_PA_PAYMENT_DATE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      (getCaseDataFromStore as jest.Mock).mockRejectedValueOnce(new Error(TestMessages.REDIS_FAILURE));
      await request(app)
        .post(CITIZEN_PA_PAYMENT_DATE_URL)
        .send('year=9999')
        .send('month=12')
        .send('day=31')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on GET', () => {
    it('should redirect to task list when part admit and amount not defined', async () => {
      (getCaseDataFromStore as jest.Mock).mockResolvedValue({partialAdmissionPaymentAmount: jest.fn().mockReturnValue(null)});
      await request(app)
        .get(CITIZEN_PA_PAYMENT_DATE_URL)
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    it('should return payment date page', async () => {
      (getCaseDataFromStore as jest.Mock).mockResolvedValue({partialAdmissionPaymentAmount: jest.fn().mockReturnValue(100)})
      await request(app)
        .get(CITIZEN_PA_PAYMENT_DATE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('What date will you pay on?');
          expect(res.text).toContain('name="year" type="text"');
          expect(res.text).toContain('name="month" type="text"');
          expect(res.text).toContain('name="day" type="text"');
        });
    });
    it('should return payment date page with payment date loaded from Redis', async () => {
      jest
        .spyOn(PaymentDateService.prototype, 'getPaymentDate')
        .mockResolvedValueOnce({day: 1, month: 6, year: 2025});
      await request(app)
        .get(CITIZEN_PA_PAYMENT_DATE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('What date will you pay on?');
          expect(res.text).toContain('name="year" type="text" value="2025"');
          expect(res.text).toContain('name="month" type="text" value="6"');
          expect(res.text).toContain('name="day" type="text" value="1"');
        });
    });
  });
  describe('on POST', () => {
    it('should create a new claim if redis gives undefined', async () => {
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(new Claim());
      await request(app)
        .post(CITIZEN_PA_PAYMENT_DATE_URL)
        .send('year=9999')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });
    it('should return errors on no input', async () => {
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(civilClaimResponseMock.case_data);
      await request(app)
        .post(CITIZEN_PA_PAYMENT_DATE_URL)
        .send('year=')
        .send('month=')
        .send('day=')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_DAY);
          expect(res.text).toContain(TestMessages.VALID_MONTH);
          expect(res.text).toContain(TestMessages.VALID_YEAR);
        });
    });
    it('should return error on date in the past', async () => {
      await request(app)
        .post(CITIZEN_PA_PAYMENT_DATE_URL)
        .send('year=1999')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.FIRST_PAYMENT_MESSAGE);
        });
    });
    it('should return error on incorrect input', async () => {
      await request(app)
        .post(CITIZEN_PA_PAYMENT_DATE_URL)
        .send('year=')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_YEAR);
        });
    });
    it('should accept a future date', async () => {
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(civilClaimResponseMock.case_data);
      await request(app)
        .post(CITIZEN_PA_PAYMENT_DATE_URL)
        .send('year=9999')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    it('should redirect to claim task list page on valid payment date', async () => {
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(civilClaimResponseMock.case_data);
      await request(app)
        .post(CITIZEN_PA_PAYMENT_DATE_URL)
        .send('year=9999')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(`Redirecting to ${RESPONSE_TASK_LIST_URL}`);
        });
    });
  });
});
