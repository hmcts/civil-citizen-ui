import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  CCJ_PAID_AMOUNT_SUMMARY_URL,
  CCJ_PAYMENT_OPTIONS_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import civilClaimResponseClaimantIntentMock
  from '../../../../../utils/mocks/civilClaimResponseClaimantIntentionMock.json';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/common/utils/dateUtils');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Judgment Amount Summary', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return judgement summary page - from request CCJ', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseClaimantIntentMock.case_data);
      });
      const res = await request(app)
        .get(CCJ_PAID_AMOUNT_SUMMARY_URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain('Judgment amount');
    });

    it('should return http 500 when has error in the get method - from request CCJ', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CCJ_PAID_AMOUNT_SUMMARY_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect to ccj payment options - from request CCJ', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseClaimantIntentMock.case_data);
      });
      const res = await request(app).post(CCJ_PAID_AMOUNT_SUMMARY_URL).send();
      expect(res.status).toBe(302);
      expect(res.get('location')).toBe(CCJ_PAYMENT_OPTIONS_URL);
    });
  });

});
