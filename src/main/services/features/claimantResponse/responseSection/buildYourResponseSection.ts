import {Claim} from 'models/claim';
import {summarySection, SummarySection} from 'models/summaryList/summarySections';
import {t} from 'i18next';
import {SummaryRow, summaryRow} from 'models/summaryList/summaryList';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  CLAIMANT_RESPONSE_INTENTION_TO_PROCEED_URL,
  CLAIMANT_RESPONSE_PART_PAYMENT_RECEIVED_URL,
  CLAIMANT_RESPONSE_REJECTION_REASON_URL,
  CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL,
  CLAIMANT_RESPONSE_SETTLE_CLAIM_URL,
} from 'routes/urls';
import {changeLabel} from 'common/utils/checkYourAnswer/changeButton';
import {YesNo, YesNoUpperCase} from 'form/models/yesNo';
import {ClaimResponseStatus} from 'models/claimResponseStatus';
import {RESPONSEFORNOTPAIDPAYIMMEDIATELY} from 'models/claimantResponse/checkAnswers';

export const buildFDDisputeTheClaimSummaryRows = (claim: Claim, claimId: string, lang : string) : SummaryRow =>{
  const intentionToProceedHref = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_INTENTION_TO_PROCEED_URL);
  const intentionToProceed = claim.claimantResponse?.intentionToProceed?.option === YesNo.YES ? YesNoUpperCase.YES : YesNoUpperCase.NO;
  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.PROCEED_WITH_CLAIM', {lang}),
    t(`COMMON.${intentionToProceed}`, {lang}),
    intentionToProceedHref,
    changeLabel(lang));
};

export const buildPartAdmitPayImmediatelySummaryRows = (claim: Claim, claimId: string, lng : string) : SummaryRow =>{
  const partAdmitAcceptedHref = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL);
  const selectedOption = claim?.claimantResponse?.hasPartAdmittedBeenAccepted?.option;
  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.DO_YOU_ACCEPT_OR_REJECT_THE_DEFENDANTS_ADMISSION', {lng}),
    t(RESPONSEFORNOTPAIDPAYIMMEDIATELY[selectedOption], {lng}),
    partAdmitAcceptedHref,
    changeLabel(lng));

};

export const getDoYouAgreeDefendantPaid = ( claim : Claim, claimId: string, lng: string): SummaryRow => {

  const option = claim.claimantResponse?.hasDefendantPaidYou?.option === YesNo.YES
    ? YesNoUpperCase.YES
    : YesNoUpperCase.NO;

  let paidAmount: number;
  if (claim.isFullDefence()) {
    paidAmount = claim.isRejectAllOfClaimAlreadyPaid();
  } else if (claim.isPartialAdmissionPaid()) {
    paidAmount = claim.partialAdmissionPaidAmount();
  }

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.DO_YOU_AGREE_PAID', {lng, paidAmount}),
    t(`COMMON.${option}`, {lng}),
    constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_PART_PAYMENT_RECEIVED_URL),
    changeLabel(lng),
  );
};

export const getDoYouWantToSettlePaid = ( claim : Claim, claimId: string, lng: string): SummaryRow => {

  const option = claim.claimantResponse?.hasPartPaymentBeenAccepted?.option === YesNo.YES
    ? YesNoUpperCase.YES
    : YesNoUpperCase.NO;

  const paidAmount = claim.isFullDefence()
    ? claim.isRejectAllOfClaimAlreadyPaid()
    : claim.partialAdmissionPaidAmount();

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_TO_SETTLE_PAID', {lng, paidAmount}),
    t(`COMMON.${option}`, {lng}),
    constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_SETTLE_CLAIM_URL),
    changeLabel(lng),
  );
};

export const getReasonForRejecting = (claim : Claim, claimId: string, lng: string): SummaryRow => {
  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.REASON_FOR_REJECTING', {lng}),
    claim.claimantResponse?.rejectionReason?.text,
    constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_REJECTION_REASON_URL),
    changeLabel(lng),
  );
};

export const buildYourResponseSection = (claim: Claim, claimId: string, lng: string): SummarySection => {
  const yourResponse = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE', {lng}),
    summaryRows: [],
  });

  if (claim.claimantResponse?.hasDefendantPaidYou?.option) {
    yourResponse.summaryList.rows.push(getDoYouAgreeDefendantPaid(claim, claimId, lng));
  }
  if (claim.claimantResponse?.hasPartPaymentBeenAccepted?.option) {
    yourResponse.summaryList.rows.push(getDoYouWantToSettlePaid(claim, claimId, lng));
  }
  if (claim.isRejectionReasonCompleted()) {
    yourResponse.summaryList.rows.push(getReasonForRejecting(claim, claimId, lng));
  }

  if (claim.isRejectAllOfClaimDispute()) {
    yourResponse.summaryList.rows.push(buildFDDisputeTheClaimSummaryRows(claim, claimId, lng));
  }

  if (claim?.responseStatus === ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY) {
    yourResponse.summaryList.rows.push(buildPartAdmitPayImmediatelySummaryRows(claim, claimId, lng));
  }

  return yourResponse;
};
