import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../../../main/app';
import {
  CITIZEN_PAYMENT_DATE_URL,
  CITIZEN_PAYMENT_OPTION_URL,
  RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {civilClaimResponseMock} from '../../../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../../../utils/errorMessageTestConstants';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';

jest.mock('../../../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Payment Option Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on Get', () => {
    it('should return payment option page successfully', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app)
        .get(CITIZEN_PAYMENT_OPTION_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('When do you want to pay?');
        });
    });

    it('should return status 500 when there is an error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CITIZEN_PAYMENT_OPTION_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on Post', () => {
    beforeAll(() => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
    });

    it('should validate when option is not selected', async () => {
      await request(app)
        .post(CITIZEN_PAYMENT_OPTION_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_PAYMENT_OPTION);
        });
    });
    it('should redirect to claim list when immediately option is selected', async () => {
      await request(app)
        .post(CITIZEN_PAYMENT_OPTION_URL)
        .send('paymentType=IMMEDIATELY')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });
    it('should redirect to claim list when instalments option is selected', async () => {
      await request(app)
        .post(CITIZEN_PAYMENT_OPTION_URL)
        .send('paymentType=IMMEDIATELY')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });
    it('should redirect to claim list when instalments option is selected', async () => {
      await request(app)
        .post(CITIZEN_PAYMENT_OPTION_URL)
        .send('paymentType=BY_SET_DATE')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_PAYMENT_DATE_URL);
        });
    });
    it('should return 500 status when there is error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(CITIZEN_PAYMENT_OPTION_URL)
        .send('paymentType=BY_SET_DATE')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
