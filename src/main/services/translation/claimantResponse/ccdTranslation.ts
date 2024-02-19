import {CCDClaim} from 'models/civilClaimResponse';
import {Claim} from 'models/claim';
import {toCCDParty} from '../response/convertToCCDParty';
import {toCCDYesNo} from '../response/convertToCCDYesNo';
import {toCCDDJPaymentOption} from 'services/translation/claimantResponse/convertToCCDDJPaymentOption';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {toCCDDJPaymentFrequency} from 'services/translation/response/convertToCCDDJPaymentFrequency';
import {convertToPence} from 'services/translation/claim/moneyConversation';
import {ClaimantResponse} from 'common/models/claimantResponse';

export const translateClaimantResponseDJToCCD = (claim: Claim): CCDClaim => {
  const claimantResponse = Object.assign(new ClaimantResponse(), claim.claimantResponse);
  return {
    applicant1: toCCDParty(claim.applicant1),
    respondent1: toCCDParty(claim.respondent1),
    //TO DO: Test the commented code creating the claim from CUI.
    //applicant1Represented: YesNoUpperCamelCase.NO,
    totalClaimAmount: claim.totalClaimAmount,
    partialPayment: toCCDYesNo(claimantResponse.getHasDefendantPaid),
    partialPaymentAmount: claimantResponse.hasDefendantPaid ? convertToPence(claimantResponse.getDefendantPaidAmount).toString() : undefined,
    paymentTypeSelection: toCCDDJPaymentOption( claimantResponse.getCCJPaymentOption),
    paymentSetDate: claimantResponse.getCCJPaymentOption === PaymentOptionType.BY_SET_DATE ? claimantResponse.getCCJPaymentDate : undefined,
    repaymentFrequency: claimantResponse.getCCJPaymentOption === PaymentOptionType.INSTALMENTS ? toCCDDJPaymentFrequency(claimantResponse.getCCJRepaymentPlanFrequency) : undefined,
    repaymentDue:claimantResponse.hasDefendantPaid ? (claimantResponse.getCCJTotalAmount - claimantResponse.getDefendantPaidAmount).toString() : undefined,
    repaymentSuggestion: claimantResponse.getCCJPaymentOption === PaymentOptionType.INSTALMENTS ? claimantResponse.getCCJRepaymentPlanAmount.toString() : undefined,
  };
};
