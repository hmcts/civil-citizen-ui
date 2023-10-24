import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  CCJ_EXTENDED_PAID_AMOUNT_SUMMARY_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {mockCivilClaimUndefined} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/common/utils/dateUtils');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Judgment Amount Summary Extended', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const mockClaim = new Claim();

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return judgement summary page - from claimant response task-list', async () => {
      nock('http://192.168.0.25:4000')
        .get('/fees/claim/1000')
        .reply(200, {'calculatedAmountInPence': '50'});
      mockClaim.totalClaimAmount = 1000;

      mockGetCaseData.mockImplementation(() => mockClaim);
      const res = await request(app)
        .get(CCJ_EXTENDED_PAID_AMOUNT_SUMMARY_URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain('Judgment amount');
    });

    it('should return http 500 when has error in the get method - from claimant response task-list', async () => {
      nock('http://192.168.0.25:4000')
        .get('/fees/claim/1000')
        .reply(500, mockCivilClaimUndefined);

      await request(app)
        .get(CCJ_EXTENDED_PAID_AMOUNT_SUMMARY_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect to payment options - fom claimant response task-list', async () => {
      const res = await request(app).post(CCJ_EXTENDED_PAID_AMOUNT_SUMMARY_URL).send();
      expect(res.status).toBe(302);
      expect(res.get('location')).toBe(CLAIMANT_RESPONSE_TASK_LIST_URL);
    });
  });
});
