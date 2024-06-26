import {CCDClaim} from 'models/civilClaimResponse';
import {Claim} from 'models/claim';
import {toCCDParty} from '../response/convertToCCDParty';
import {toCCDYesNo} from '../response/convertToCCDYesNo';
import {toCCDDJPaymentOption} from 'services/translation/claimantResponse/convertToCCDDJPaymentOption';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {toCCDDJPaymentFrequency} from 'services/translation/response/convertToCCDDJPaymentFrequency';
import {convertToPence} from 'services/translation/claim/moneyConversation';

export const translateClaimantResponseDJToCCD = (claim: Claim): CCDClaim => {
  return {
    applicant1: toCCDParty(claim.applicant1),
    respondent1: toCCDParty(claim.respondent1),
    //TO DO: Test the commented code creating the claim from CUI.
    //applicant1Represented: YesNoUpperCamelCase.NO,
    totalClaimAmount: claim.totalClaimAmount,
    partialPayment: toCCDYesNo(claim.getHasDefendantPaid()),
    partialPaymentAmount: claim.hasDefendantPaid() ? convertToPence(claim.getDefendantPaidAmount()).toString() : undefined,
    paymentTypeSelection: toCCDDJPaymentOption( claim.getCCJPaymentOption()),
    paymentSetDate: claim.getCCJPaymentOption() === PaymentOptionType.BY_SET_DATE ? claim.getCCJPaymentDate() : undefined,
    repaymentFrequency: claim.getCCJPaymentOption() === PaymentOptionType.INSTALMENTS ? toCCDDJPaymentFrequency(claim.getCCJRepaymentPlanFrequency()) : undefined,
    repaymentDue:claim.hasDefendantPaid() ? (claim.getCCJTotalAmount() - claim.getDefendantPaidAmount()).toString() : undefined,
    repaymentSuggestion: claim.getCCJPaymentOption() === PaymentOptionType.INSTALMENTS ? claim.getCCJRepaymentPlanAmount().toString() : undefined,
  };
};
