import {YesNo} from 'form/models/yesNo';
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
    partialPayment: toCCDYesNo(claim.claimantResponse?.ccjRequest?.paidAmount?.option),
    partialPaymentAmount: claim.claimantResponse?.ccjRequest?.paidAmount?.option === YesNo.YES ? convertToPence(claim.claimantResponse?.ccjRequest?.paidAmount?.amount).toString() : undefined,
    paymentTypeSelection: toCCDDJPaymentOption( claim.claimantResponse?.ccjRequest?.ccjPaymentOption?.type),
    paymentSetDate: claim.claimantResponse?.ccjRequest?.ccjPaymentOption?.type === PaymentOptionType.BY_SET_DATE ? claim.claimantResponse?.ccjRequest?.defendantPaymentDate?.date : undefined,
    repaymentFrequency: claim.claimantResponse?.ccjRequest?.ccjPaymentOption?.type === PaymentOptionType.INSTALMENTS ? toCCDDJPaymentFrequency(claim.claimantResponse?.ccjRequest?.repaymentPlanInstalments?.paymentFrequency) : undefined,
    repaymentDue:claim.claimantResponse?.ccjRequest?.paidAmount?.option === YesNo.YES ? (claim.claimantResponse?.ccjRequest?.paidAmount?.totalAmount - claim.claimantResponse?.ccjRequest?.paidAmount?.amount).toString() : undefined,
    repaymentSuggestion: claim.claimantResponse?.ccjRequest?.ccjPaymentOption?.type === PaymentOptionType.INSTALMENTS ? claim.claimantResponse?.ccjRequest?.repaymentPlanInstalments?.amount.toString() : undefined,
  };
};
