import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  CCJ_PAID_AMOUNT_URL,
  CCJ_PAID_AMOUNT_SUMMARY_URL, CCJ_EXTENDED_PAID_AMOUNT_URL, CCJ_EXTENDED_PAID_AMOUNT_SUMMARY_URL,
} from 'routes/urls';
import {
  civilClaimResponseMock,
} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import * as utilService from 'modules/utilityService';
import {Claim} from 'models/claim';
import noRespondentTelephoneClaimantIntentionMock
  from '../../../../../utils/mocks/noRespondentTelephoneClaimantIntentionMock.json';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('CCJ - Paid amount', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(utilService, 'getClaimById').mockResolvedValue({ isClaimantIntentionPending: () => true } as Claim);
  });

  describe('on GET', () => {
    it('should return Paid amount page', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      const res = await request(app).get(CCJ_PAID_AMOUNT_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Has the defendant paid some of the amount owed?');
    });

    it('should return status 500 when error thrown', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      const res = await request(app).get(CCJ_PAID_AMOUNT_URL);
      expect(res.status).toBe(500);
      expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
    });
  });

  describe('on GET from task-list', () => {
    it('should return Paid amount page from task-list', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      const res = await request(app).get(CCJ_EXTENDED_PAID_AMOUNT_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Has the defendant paid some of the amount owed?');
    });

    it('should return status 500 when error thrown from task-list', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      const res = await request(app).get(CCJ_EXTENDED_PAID_AMOUNT_URL);
      expect(res.status).toBe(500);
      expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
    });
  });

  describe('on POST', () => {
    beforeAll(() => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
    });

    it('should return error on empty post', async () => {
      const res = await request(app).post(CCJ_PAID_AMOUNT_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(TestMessages.VALID_YES_NO_OPTION);
    });

    it('should return error on empty already paid amount', async () => {
      const res = await request(app).post(CCJ_PAID_AMOUNT_URL)
        .send({
          option: 'yes',
          amount: '',
        });
      expect(res.status).toBe(200);
      expect(res.text).toContain(TestMessages.INVALID_AMOUNT);
    });

    it('should return error maximum 2 decimal', async () => {
      const res = await request(app).post(CCJ_PAID_AMOUNT_URL)
        .send({
          option: 'yes',
          amount: '100.455',
        });
      expect(res.status).toBe(200);
      expect(res.text).toContain(TestMessages.VALID_TWO_DECIMAL_NUMBER);
    });

    it('should return error with amount greater then the claimed amount', async () => {
      const res = await request(app).post(CCJ_PAID_AMOUNT_URL)
        .send({
          option: 'yes',
          amount: '5555',
        });
      expect(res.status).toBe(200);
      expect(res.text).toContain(TestMessages.PAID_AMOUNT_NOT_GREATER);
    });

    it('should return error with equal amount with the claimed amount', async () => {
      const res = await request(app).post(CCJ_PAID_AMOUNT_URL)
        .send({
          option: 'yes',
          amount: '110',
        });
      expect(res.status).toBe(200);
      expect(res.text).toContain(TestMessages.PAID_AMOUNT_NOT_GREATER);
    });

    it('should redirect to paid amount summary page if option yes is selected with valid amount', async () => {
      const res = await request(app).post(CCJ_PAID_AMOUNT_URL)
        .send({
          option: 'yes',
          amount: '10',
        });
      expect(res.status).toBe(302);
      expect(res.get('location')).toBe(CCJ_PAID_AMOUNT_SUMMARY_URL);
    });

    it('should redirect to paid amount summary page if option no is selected', async () => {
      const res = await request(app).post(CCJ_PAID_AMOUNT_URL).send({option: 'no'});
      expect(res.status).toBe(302);
      expect(res.get('location')).toBe(CCJ_PAID_AMOUNT_SUMMARY_URL);
    });

    it('should return status 500 when error thrown', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      const res = await request(app).post(CCJ_PAID_AMOUNT_URL)
        .send({option: 'no'});
      expect(res.status).toBe(500);
      expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
    });
  });

  describe('on POST', () => {
    beforeAll(() => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), noRespondentTelephoneClaimantIntentionMock.case_data);
      });
    });
    it('should redirect to paid amount summary page if option yes is selected with valid amount', async () => {
      const res = await request(app).post(CCJ_PAID_AMOUNT_URL)
        .send({
          option: 'yes',
          amount: '10',
        });
      expect(res.status).toBe(302);
      expect(res.get('location')).toBe(CCJ_PAID_AMOUNT_SUMMARY_URL);
    });

    it('should redirect to paid amount summary page if option no is selected', async () => {
      const res = await request(app).post(CCJ_PAID_AMOUNT_URL).send({option: 'no'});
      expect(res.status).toBe(302);
      expect(res.get('location')).toBe(CCJ_PAID_AMOUNT_SUMMARY_URL);
    });

    it('(FROM TASK-LIST) should redirect to paid amount summary page if option yes is selected with valid amount', async () => {
      const res = await request(app).post(CCJ_EXTENDED_PAID_AMOUNT_URL)
        .send({
          option: 'yes',
          amount: '10',
        });
      expect(res.status).toBe(302);
      expect(res.get('location')).toBe(CCJ_EXTENDED_PAID_AMOUNT_SUMMARY_URL);
    });

    it('(FROM TASK-LIST) should redirect to paid amount summary page if option no is selected', async () => {
      const res = await request(app).post(CCJ_EXTENDED_PAID_AMOUNT_URL).send({option: 'no'});
      expect(res.status).toBe(302);
      expect(res.get('location')).toBe(CCJ_EXTENDED_PAID_AMOUNT_SUMMARY_URL);
    });
  });
});
