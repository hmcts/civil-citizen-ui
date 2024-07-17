import {app} from '../../../../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {CITIZEN_COURT_ORDERS_URL, ON_TAX_PAYMENTS_URL} from 'routes/urls';
import {TestMessages} from '../../../../../../../utils/errorMessageTestConstants';
import {YesNo} from 'form/models/yesNo';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import fullAdmitPayBySetDateMock from '../../../../../../../utils/mocks/fullAdmitPayBySetDateMock.json';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('on tax payments', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on Get', () => {
    it('should return on tax payment page successfully', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), fullAdmitPayBySetDateMock.case_data);
      });
      await request(app).get(ON_TAX_PAYMENTS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Are you behind on tax payments?');
        });
    });
    it('should return 500 status code when error occurs', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(ON_TAX_PAYMENTS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
  describe('on Post', () => {

    beforeEach(() => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), fullAdmitPayBySetDateMock.case_data);
      });
    });

    it('should return error when no option is not selected', async () => {
      await request(app)
        .post(ON_TAX_PAYMENTS_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_YES_NO_SELECTION);
        });
    });
    it('should return errors when no option yes is selected and amount and reason are not defined', async () => {
      await request(app)
        .post(ON_TAX_PAYMENTS_URL)
        .send({option: YesNo.YES, amountYouOwe: null, reason: undefined})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_OWED_AMOUNT_REQUIRED);
          expect(res.text).toContain(TestMessages.VALID_REASON_REQUIRED);
        });
    });
    it('should return errors when option yes is selected and amount is 0', async () => {
      await request(app)
        .post(ON_TAX_PAYMENTS_URL)
        .send({option: YesNo.YES, amountYouOwe: 0, reason: 'reason'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_OWED_AMOUNT_REQUIRED);
        });
    });
    it('should return errors when option yes is selected and amount is -1', async () => {
      await request(app)
        .post(ON_TAX_PAYMENTS_URL)
        .send({option: YesNo.YES, amountYouOwe: -1, reason: 'reason'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_OWED_AMOUNT_REQUIRED);
        });
    });
    it('should return errors when option yes is selected and amount is abc', async () => {
      await request(app)
        .post(ON_TAX_PAYMENTS_URL)
        .send({option: YesNo.YES, amountYouOwe: 'abc', reason: 'reason'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_TWO_DECIMAL_NUMBER);
        });
    });
    it('should return errors when option yes is selected and amount has more than two decimal places', async () => {
      await request(app)
        .post(ON_TAX_PAYMENTS_URL)
        .send({option: YesNo.YES, amountYouOwe: 44.4444, reason: 'reason'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_TWO_DECIMAL_NUMBER);
        });
    });
    it('should return errors when option yes is selected and reason is not selected', async () => {
      await request(app)
        .post(ON_TAX_PAYMENTS_URL)
        .send({option: YesNo.YES, amountYouOwe: 44.44, reason: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_REASON_REQUIRED);
        });
    });
    it('should redirect with valid input', async () => {
      await request(app)
        .post(ON_TAX_PAYMENTS_URL)
        .send({option: YesNo.YES, amountYouOwe: 44.4, reason: 'reason'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_COURT_ORDERS_URL);
        });
    });
    it('should return status 500 when there is error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(ON_TAX_PAYMENTS_URL)
        .send({option: YesNo.YES, amountYouOwe: 44.4, reason: 'reason'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
