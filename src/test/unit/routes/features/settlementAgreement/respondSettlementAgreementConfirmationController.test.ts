import request from 'supertest';
import {app} from '../../../../../main/app';
import {Claim} from 'common/models/claim';
import {DEFENDANT_SIGN_SETTLEMENT_AGREEMENT_CONFIRMATION} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {FullAdmission} from 'models/fullAdmission';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {RepaymentDecisionType} from 'models/claimantResponse/RepaymentDecisionType';
import {ClaimantResponse} from 'models/claimantResponse';
import {getClaimById} from 'modules/utilityService';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/utilityService');
jest.mock('routes/guards/respondSettlementAgreementConfirmationGuard', () => ({
  respondSettlementAgreementConfirmationGuard: jest.fn((req, res, next) => {
    next();
  }),
}));
jest.mock('modules/utilityService', () => ({
  getRedisStoreForSession: jest.fn(),
  getClaimById: jest.fn(),
}));

describe('Claimant response confirmation controller', () => {

  function getMockClaim() {
    const mockClaim = new Claim();
    mockClaim.fullAdmission = new FullAdmission();
    mockClaim.fullAdmission.paymentIntention = new PaymentIntention();
    mockClaim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
    mockClaim.respondentSignSettlementAgreement = YesNoUpperCamelCase.YES;
    return mockClaim;
  }
  describe('on GET', () => {
    it('should return accept settlement agreement confirmation', async () => {
      // Given
      const mockClaim = getMockClaim();
      (getClaimById as jest.Mock).mockResolvedValueOnce(mockClaim);
      // When
      const res = await request(app).get(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT_CONFIRMATION);
      // Then
      expect(res.status).toBe(200);
      expect(res.text).toContain("You've both signed a settlement agreement");
    });

    it('In favour claimant-should return accept settlement agreement confirmation', async () => {
      // Given
      const mockClaim = new Claim();
      mockClaim.claimantResponse= new ClaimantResponse();
      mockClaim.claimantResponse.courtDecision =
          RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT;
      mockClaim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
      mockClaim.claimantResponse.suggestedPaymentIntention.paymentOption =
          PaymentOptionType.IMMEDIATELY;
      mockClaim.claimantResponse.suggestedImmediatePaymentDeadLine = new Date();
      mockClaim.respondentSignSettlementAgreement = YesNoUpperCamelCase.YES;

      (getClaimById as jest.Mock).mockResolvedValueOnce(mockClaim);
      // When
      const res = await request(app).get(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT_CONFIRMATION);
      // Then
      expect(res.status).toBe(200);
      expect(res.text).toContain("You've both signed a settlement agreement");
    });

    it('In favour claimant-should return accept settlement agreement confirmation', async () => {
      // Given
      const mockClaim = new Claim();
      mockClaim.claimantResponse= new ClaimantResponse();
      mockClaim.claimantResponse.courtDecision =
          RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT;
      mockClaim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
      mockClaim.claimantResponse.suggestedPaymentIntention.paymentOption =
          PaymentOptionType.BY_SET_DATE;
      mockClaim.claimantResponse.suggestedPaymentIntention.paymentDate = new Date();
      mockClaim.respondentSignSettlementAgreement = YesNoUpperCamelCase.YES;

      (getClaimById as jest.Mock).mockResolvedValueOnce(mockClaim);

      // When
      const res = await request(app).get(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT_CONFIRMATION);
      // Then
      expect(res.status).toBe(200);
      expect(res.text).toContain("You've both signed a settlement agreement");
    });

    it('should return reject settlement agreement confirmation', async () => {
      // Given
      const mockClaim = getMockClaim();
      mockClaim.respondentSignSettlementAgreement = YesNoUpperCamelCase.NO;
      (getClaimById as jest.Mock).mockResolvedValueOnce(mockClaim);
      // When
      const res = await request(app).get(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT_CONFIRMATION);
      // Then
      expect(res.status).toBe(200);
      expect(res.text).toContain("You've rejected the settlement agreement");
    });

    it('should return http 500 when has error in the get method', async () => {
      // Given
      const error = new Error('Test error');
      (getClaimById as jest.Mock).mockRejectedValue(error);
      // When
      const res = await request(app).get(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT_CONFIRMATION);
      // Then
      expect(res.status).toBe(500);
      expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
    });
  });
});
