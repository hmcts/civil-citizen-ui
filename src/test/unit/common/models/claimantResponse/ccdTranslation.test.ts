import { CCDClaim } from 'models/civilClaimResponse';
import { Claim } from 'models/claim';
import { PaymentOptionType } from 'form/models/admission/paymentOption/paymentOptionType';
import { toCCDDJPaymentFrequency } from 'services/translation/response/convertToCCDDJPaymentFrequency';
import { toCCDDJPaymentOption } from 'services/translation/claimantResponse/convertToCCDDJPaymentOption';
import { toCCDParty } from '../../../../../main/services/translation/response/convertToCCDParty';
import { toCCDYesNo } from '../../../../../main/services/translation/response/convertToCCDYesNo';
import { translateClaimantResponseDJToCCD } from '../../../../../main/services/translation/claimantResponse/ccdTranslation';
import { YesNo, YesNoUpperCamelCase } from 'common/form/models/yesNo';

describe('translateClaimantResponseDJToCCD', () => {
  const claim: Claim = {
    applicant1: {
      name: 'John Doe',
    },
    respondent1: {
      name: 'Jane Smith',
    },
    totalClaimAmount: 100,
    claimantResponse: {
      ccjRequest: {
        paidAmount: {
          option: 'YES',
          amount: 50,
          totalAmount: 100,
        },
        ccjPaymentOption: {
          type: PaymentOptionType.BY_SET_DATE,
        },
        defendantPaymentDate: {
          date: '2022-01-01',
        },
      },
    },
  };

  test('should translate the claimant response to CCD format', () => {
    // given
    const expectedCCDClaim: CCDClaim = {
      applicant1: toCCDParty(claim.applicant1),
      respondent1: toCCDParty(claim.respondent1),
      applicant1Represented: YesNoUpperCamelCase.NO,
      totalClaimAmount: claim.totalClaimAmount,
      partialPayment: toCCDYesNo(claim.claimantResponse?.ccjRequest?.paidAmount?.option),
      partialPaymentAmount: claim.claimantResponse?.ccjRequest?.paidAmount?.option === YesNo.YES ? claim.claimantResponse?.ccjRequest?.paidAmount?.amount.toString() : undefined,
      paymentTypeSelection: toCCDDJPaymentOption(claim.claimantResponse?.ccjRequest?.ccjPaymentOption?.type),
      paymentSetDate: claim.claimantResponse?.ccjRequest?.ccjPaymentOption?.type === PaymentOptionType.BY_SET_DATE ? claim.claimantResponse?.ccjRequest?.defendantPaymentDate?.date : undefined,
      repaymentFrequency: claim.claimantResponse?.ccjRequest?.ccjPaymentOption?.type === PaymentOptionType.INSTALMENTS ? toCCDDJPaymentFrequency(claim.claimantResponse?.ccjRequest?.repaymentPlanInstalments?.paymentFrequency) : undefined,
      repaymentDue: claim.claimantResponse?.ccjRequest?.paidAmount?.option === YesNo.YES ? (claim.claimantResponse?.ccjRequest?.paidAmount?.totalAmount - claim.claimantResponse?.ccjRequest?.paidAmount?.amount).toString() : undefined,
      repaymentSuggestion: claim.claimantResponse?.ccjRequest?.ccjPaymentOption?.type === PaymentOptionType.INSTALMENTS ? claim.claimantResponse?.ccjRequest?.repaymentPlanInstalments?.amount.toString() : undefined,
    };

    // when
    const result = translateClaimantResponseDJToCCD(claim);

    // then
    expect(result).toEqual(expectedCCDClaim);
  });
});