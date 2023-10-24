import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  CCJ_PAID_AMOUNT_SUMMARY_URL,
  CCJ_PAYMENT_OPTIONS_URL,
} from 'routes/urls';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {mockCivilClaimUndefined} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/common/utils/dateUtils');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Judgment Amount Summary', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const mockClaim = new Claim();

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return judgement summary page - from request CCJ', async () => {
      nock('http://192.168.0.25:4000')
        .get('/fees/claim/1000')
        .reply(200, {'calculatedAmountInPence': '50'});
      mockClaim.totalClaimAmount = 1000;

      mockGetCaseData.mockImplementation(() => mockClaim);
      const res = await request(app)
        .get(CCJ_PAID_AMOUNT_SUMMARY_URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain('Judgment amount');
    });

    it('should return http 500 when has error in the get method - from request CCJ', async () => {

      nock('http://192.168.0.25:4000')
        .get('/fees/claim/1000')
        .reply(500, mockCivilClaimUndefined);

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
      const res = await request(app).post(CCJ_PAID_AMOUNT_SUMMARY_URL).send();
      expect(res.status).toBe(302);
      expect(res.get('location')).toBe(CCJ_PAYMENT_OPTIONS_URL);
    });
  });

});
