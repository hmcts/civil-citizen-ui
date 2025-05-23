import {CCDClaim} from 'models/civilClaimResponse';
import {Claim} from 'models/claim';
import {toCCDParty} from '../response/convertToCCDParty';
import {toCCDYesNo} from '../response/convertToCCDYesNo';
import {toCCDDJPaymentOption} from 'services/translation/claimantResponse/convertToCCDDJPaymentOption';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {toCCDDJPaymentFrequency} from 'services/translation/response/convertToCCDDJPaymentFrequency';
import {convertToPence} from 'services/translation/claim/moneyConversation';
import {getJudgmentAmountSummary} from 'services/features/claimantResponse/ccj/judgmentAmountSummaryService';
import {convertToPoundsFilter} from 'common/utils/currencyFormat';

export const translateClaimantResponseDJToCCD = async (claim: Claim): Promise<CCDClaim> => {
  const summaryDetails = await getJudgmentAmountSummary(claim, convertToPoundsFilter(claim.claimFee?.calculatedAmountInPence), 'en');
  const interest = Number(summaryDetails.interestToDate || 0);
  let repaymentSummary = `The judgment will order the defendants to pay £${summaryDetails.total}, including the claim fee and interest, if applicable, as shown:\n### Claim amount \n £${claim.totalClaimAmount}\n`;
  if(interest !== 0) {
    repaymentSummary = repaymentSummary + ` ### Claim interest amount \n £${interest} \n`;
  }
  repaymentSummary= repaymentSummary + ` ### Claim fee amount \n £${summaryDetails.claimFeeAmount}\n ## Subtotal \n £${summaryDetails.subTotal}\n ## Total still owed \n £${summaryDetails.total}`;
  return {
    applicant1: toCCDParty(claim.applicant1),
    respondent1: toCCDParty(claim.respondent1),
    //TO DO: Test the commented code creating the claim from CUI.
    //applicant1Represented: YesNoUpperCamelCase.NO,
    totalClaimAmount: claim.totalClaimAmount,
    totalInterest: Number(summaryDetails.interestToDate || 0),
    partialPayment: toCCDYesNo(claim.getHasDefendantPaid()),
    partialPaymentAmount: claim.hasDefendantPaid() ? convertToPence(claim.getDefendantPaidAmount()).toString() : undefined,
    paymentTypeSelection: toCCDDJPaymentOption( claim.getCCJPaymentOption()),
    paymentSetDate: claim.getCCJPaymentOption() === PaymentOptionType.BY_SET_DATE ? claim.getCCJPaymentDate() : undefined,
    repaymentFrequency: claim.getCCJPaymentOption() === PaymentOptionType.INSTALMENTS ? toCCDDJPaymentFrequency(claim.getCCJRepaymentPlanFrequency()) : undefined,
    repaymentDue:claim.hasDefendantPaid() ? (claim.getCCJTotalAmount() - claim.getDefendantPaidAmount()).toString() : undefined,
    repaymentSuggestion: claim.getCCJPaymentOption() === PaymentOptionType.INSTALMENTS ? convertToPence(claim.getCCJRepaymentPlanAmount()).toString() : undefined,
    repaymentDate: claim.getCCJPaymentOption() === PaymentOptionType.INSTALMENTS ? claim.getCCJRepaymentPlanDate() : undefined,
    repaymentSummaryObject: repaymentSummary,
  };
};
