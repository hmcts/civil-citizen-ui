import request from 'supertest';
import nock from 'nock';
import config from 'config';
import {app} from '../../../../../main/app';
import {Claim} from 'common/models/claim';
import {DEFENDANT_SIGN_SETTLEMENT_AGREEMENT_CONFIRMATION} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {getClaimById} from 'modules/utilityService';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/utilityService');
jest.mock('routes/guards/respondSettlementAgreementConfirmationGuard', () => ({
  respondSettlementAgreementConfirmationGuard: jest.fn((req, res, next) => {
    next();
  }),
}));
const mockGetCaseData = getClaimById as jest.Mock;

const mockClaim = new Claim();
mockClaim.defendantSignedSettlementAgreement = true;

describe('Claimant response confirmation controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    nock('http://localhost:4000')
      .get('/cases/:id')
      .reply(200, mockClaim);
  });
  describe('on GET', () => {
    it('should return settlement agreement confirmation', async () => {
      mockGetCaseData.mockImplementation(() => mockClaim);
      const res = await request(app).get(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT_CONFIRMATION);
      expect(res.status).toBe(200);
      expect(res.text).toContain("You've both signed a settlement agreement");
    });

    it('should return http 500 when has error in the get method', async () => {
      mockGetCaseData.mockImplementation(() => {throw new Error()});
      const res = await request(app).get(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT_CONFIRMATION);
      expect(res.status).toBe(500);
      expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
    });
  });
});
