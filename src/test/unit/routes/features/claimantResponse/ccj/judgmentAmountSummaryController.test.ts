import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {CCJ_PAID_AMOUNT_SUMMARY_URL} from '../../../../../../main/routes/urls';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {mockCivilClaimUndefined} from '../../../../../utils/mockDraftStore';

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
    it('should return total amount page', async () => {
      nock('http://localhost:4000')
        .get('/fees/claim/1000')
        .reply(200, {'calculatedAmountInPence': '50'});
      mockClaim.totalClaimAmount = 1000;

      mockGetCaseData.mockImplementation(() => mockClaim);
      const res = await request(app)
        .get(CCJ_PAID_AMOUNT_SUMMARY_URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain('Judgment amount');
    });

    it('should return http 500 when has error in the get method', async () => {
      nock('http://localhost:4000')
        .get('/fees/claim/undefined')
        .reply(500, mockCivilClaimUndefined);

      await request(app)
        .get(CCJ_PAID_AMOUNT_SUMMARY_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
        });
    });
  });
});

