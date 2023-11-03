import request from 'supertest';
import {app} from '../../../../../main/app';
import {Claim} from 'common/models/claim';
import {DEFENDANT_SIGN_SETTLEMENT_AGREEMENT_CONFIRMATION} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {getClaimById} from 'modules/utilityService';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {FullAdmission} from 'models/fullAdmission';
import {YesNo} from 'form/models/yesNo';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/utilityService');
jest.mock('routes/guards/respondSettlementAgreementConfirmationGuard', () => ({
  respondSettlementAgreementConfirmationGuard: jest.fn((req, res, next) => {
    next();
  }),
}));
const mockGetCaseData = getClaimById as jest.Mock;

describe('Claimant response confirmation controller', () => {

  function getMockClaim() {
    const mockClaim = new Claim();
    mockClaim.fullAdmission = new FullAdmission();
    mockClaim.fullAdmission.paymentIntention = new PaymentIntention();
    mockClaim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
    return mockClaim;
  }

  describe('on GET', () => {
    it('should return accept settlement agreement confirmation', async () => {
      // Given
      const mockClaim = getMockClaim();
      mockClaim.defendantSignedSettlementAgreement = YesNo.YES;
      mockGetCaseData.mockImplementation(() => mockClaim);
      // When
      const res = await request(app).get(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT_CONFIRMATION);
      // Then
      expect(res.status).toBe(200);
      expect(res.text).toContain("You've both signed a settlement agreement");
    });

    it('should return reject settlement agreement confirmation', async () => {
      // Given
      const mockClaim = getMockClaim();
      mockClaim.defendantSignedSettlementAgreement = YesNo.NO;
      mockGetCaseData.mockImplementation(() => mockClaim);
      // When
      const res = await request(app).get(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT_CONFIRMATION);
      // Then
      expect(res.status).toBe(200);
      expect(res.text).toContain("You've rejected the settlement agreement");
    });

    it('should return http 500 when has error in the get method', async () => {
      // Given
      mockGetCaseData.mockImplementation(() => {throw new Error('Test error');});
      // When
      const res = await request(app).get(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT_CONFIRMATION);
      // Then
      expect(res.status).toBe(500);
      expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
    });
  });
});
