import {Claim} from 'models/claim';
import {summarySection, SummarySection} from 'models/summaryList/summarySections';
import {t} from 'i18next';
import {SummaryRow, summaryRow} from 'models/summaryList/summaryList';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  CLAIMANT_RESPONSE_ACCEPT_REPAYMENT_PLAN_URL,
  CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL,
  CLAIMANT_RESPONSE_INTENTION_TO_PROCEED_URL,
  CLAIMANT_RESPONSE_PART_PAYMENT_RECEIVED_URL,
  CLAIMANT_RESPONSE_REJECTION_REASON_URL,
  CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL,
  CLAIMANT_RESPONSE_SETTLE_CLAIM_URL,
} from 'routes/urls';
import {changeLabel} from 'common/utils/checkYourAnswer/changeButton';
import { YesNo, YesNoUpperCase } from 'form/models/yesNo';
import {
  RESPONSEFORDEFENDANTREPAYMENTPLAN,
  RESPONSEFORNOTPAIDPAYIMMEDIATELY,
  RESPONSEFREQUENCY,
  RESPONSFORCYAFORCHOOSEHOWTOPROCEED,
} from 'models/claimantResponse/checkAnswers';
import {getEmptyStringIfUndefined, getEmptyStringIfUndefinedForNumber} from 'common/utils/checkYourAnswer/formatAnswer';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {DateTime} from 'luxon';
import {PaymentDate} from 'form/models/admission/fullAdmission/paymentOption/paymentDate';

export const buildFDDisputeTheClaimSummaryRows = (claim: Claim, claimId: string, lng : string) : SummaryRow =>{
  const intentionToProceedHref = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_INTENTION_TO_PROCEED_URL);
  const intentionToProceed = claim.hasClaimantIntentToProceedResponse ? YesNoUpperCase.YES : YesNoUpperCase.NO;
  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.PROCEED_WITH_CLAIM', {lng}),
    t(`COMMON.${intentionToProceed}`, {lng}),
    intentionToProceedHref,
    changeLabel(lng));
};

export const buildPartAdmitPayImmediatelySummaryRows = (claim: Claim, claimId: string, lng : string) : SummaryRow =>{
  const partAdmitAcceptedHref = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL);
  const selectedOption = claim.claimantResponse?.hasPartAdmittedBeenAccepted?.option as YesNo;
  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.DO_YOU_ACCEPT_OR_REJECT_THE_DEFENDANTS_ADMISSION', {lng}),
    t(RESPONSEFORNOTPAIDPAYIMMEDIATELY[selectedOption], {lng}),
    partAdmitAcceptedHref,
    changeLabel(lng));

};

export const buildSummaryQuestionForDefendantRepaymentPlan = (claim: Claim, claimId: string, lng: string): SummaryRow => {
  const pageRef = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_ACCEPT_REPAYMENT_PLAN_URL);
  const selectedOption = claim.claimantResponse?.fullAdmitSetDateAcceptPayment?.option as YesNo;
  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.DO_YOU_ACCEPT_THE_DEFENDANT_REPAYMENT_PLAN', { lng }),
    t(RESPONSEFORDEFENDANTREPAYMENTPLAN[selectedOption], { lng }),
    pageRef,
    changeLabel(lng));
};

export const buildFullAdmitPayImmediatelySummaryRows = (claim: Claim, claimId: string, lang: string): SummaryRow => {
  const partAdmitAcceptedHref = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL);
  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.HOW_DO_WANT_TO_DEFENDANT_TO_PAY', {lang}),
    t('COMMON.PAYMENT_OPTION.IMMEDIATELY', {lang}),
    partAdmitAcceptedHref,
    changeLabel(lang));
};

export const buildPartAdmitPayInstallmentsSummaryRows = (claim: Claim, claimId: string, lang: string): SummaryRow[] => {
  const partAdmitAcceptedHref = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL);
  const summaryRows: SummaryRow [] = [];
  const selectedOption = claim.claimantResponse.suggestedPaymentIntention.repaymentPlan.repaymentFrequency;
  summaryRows.push(summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.HOW_DO_WANT_TO_DEFENDANT_TO_PAY', {lang}),
    t('COMMON.PAYMENT_OPTION.INSTALMENTS', {lang}),
    partAdmitAcceptedHref,
    changeLabel(lang)));
  summaryRows.push(summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.REGULAR_PAYMENTS', {lang}),
    '£' + getEmptyStringIfUndefinedForNumber(claim.claimantResponse.suggestedPaymentIntention.repaymentPlan.paymentAmount),
    partAdmitAcceptedHref,
    changeLabel(lang)));
  summaryRows.push(summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.FREQUENCY_OF_PAYMENTS', {lang}),
    t(RESPONSEFREQUENCY[selectedOption], {lang}), partAdmitAcceptedHref,
    changeLabel(lang)));
  summaryRows.push(summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.DATE_FOR_FIRST_INSTALMENT', {lang}),
    getEmptyStringIfUndefined(DateTime.fromJSDate(new Date(claim.claimantResponse.suggestedPaymentIntention.repaymentPlan.firstRepaymentDate)).setLocale('en-gb').toLocaleString(DateTime.DATE_FULL)),
    partAdmitAcceptedHref,
    changeLabel(lang)));
  return summaryRows;
};

export const buildPartAdmitPaySetDateSummaryRows = (claim: Claim, claimId: string, lang: string): SummaryRow[] => {
  const partAdmitAcceptedHref = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL);
  const summaryRows: SummaryRow [] = [];
  const date = claim.claimantResponse.suggestedPaymentIntention.paymentDate as unknown as PaymentDate;

  const paymentDate = getEmptyStringIfUndefined(DateTime.fromJSDate(new Date(date.date)).setLocale('en-gb').toLocaleString(DateTime.DATE_FULL));
  summaryRows.push(summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.HOW_DO_WANT_TO_DEFENDANT_TO_PAY', {lang}),
    t('PAGES.CHECK_YOUR_ANSWER.IN_FULL', {lang, paymentDate}),
    partAdmitAcceptedHref,
    changeLabel(lang),
  ))
  ;

  return summaryRows;
};

export const getDoYouAgreeDefendantPaid = (claim: Claim, claimId: string, lng: string): SummaryRow => {
  const option = claim.hasClaimantConfirmedDefendantPaid()
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

  const claimantOption = claim.isFullDefence() ?
    claim.claimantResponse?.hasFullDefenceStatesPaidClaimSettled?.option : claim.claimantResponse?.hasPartPaymentBeenAccepted?.option;

  const option = claimantOption === YesNo.YES
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

export const buildSummaryQuestionForChooseHowToProceed = (claim: Claim, claimId: string, lng: string) => {
  const selectedOption = claim.getHowToProceed();
  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.HOW_DO_YOU_WANT_TO_FORMALISE_THE_REPAYMENT_PLAN', { lng }),
    t(RESPONSFORCYAFORCHOOSEHOWTOPROCEED[selectedOption], { lng }),
    constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL),
    changeLabel(lng));
};

export const buildYourResponseSection = (claim: Claim, claimId: string, lng: string): SummarySection => {
  const claimantResponse = claim.claimantResponse;
  const yourResponse = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE', {lng}),
    summaryRows: [],
  });

  if (claim.isPartialAdmission() && claimantResponse.hasPartAdmittedBeenAccepted?.option) {
    yourResponse.summaryList.rows.push(buildPartAdmitPayImmediatelySummaryRows(claim, claimId, lng));
  }

  if (claimantResponse.hasDefendantPaidYou?.option) {
    yourResponse.summaryList.rows.push(getDoYouAgreeDefendantPaid(claim, claimId, lng));
  }

  if (claimantResponse.hasPartPaymentBeenAccepted?.option || claimantResponse.hasFullDefenceStatesPaidClaimSettled?.option) {
    yourResponse.summaryList.rows.push(getDoYouWantToSettlePaid(claim, claimId, lng));
  }

  if (claim.isRejectionReasonCompleted()) {
    yourResponse.summaryList.rows.push(getReasonForRejecting(claim, claimId, lng));
  }

  if (claim.isRejectAllOfClaimDispute()) {
    yourResponse.summaryList.rows.push(buildFDDisputeTheClaimSummaryRows(claim, claimId, lng));
  }

  if (claimantResponse.fullAdmitSetDateAcceptPayment?.option) {
    yourResponse.summaryList.rows.push(buildSummaryQuestionForDefendantRepaymentPlan(claim, claimId, lng));
  }

  if (claim.isClaimantRejectedPaymentPlan) {

    if (claim.getSuggestedPaymentIntentionOptionFromClaimant() === PaymentOptionType.IMMEDIATELY) {
      yourResponse.summaryList.rows.push(buildFullAdmitPayImmediatelySummaryRows(claim, claimId, lng));
    }
    if (claim.getSuggestedPaymentIntentionOptionFromClaimant() === PaymentOptionType.INSTALMENTS) {
      yourResponse.summaryList.rows.push(...buildPartAdmitPayInstallmentsSummaryRows(claim, claimId, lng));
    }

    if (claim.getSuggestedPaymentIntentionOptionFromClaimant() === PaymentOptionType.BY_SET_DATE) {
      yourResponse.summaryList.rows.push(...buildPartAdmitPaySetDateSummaryRows(claim, claimId, lng));
    }
  }

  return yourResponse;
};

export const buildHowYouWishToProceed = (claim: Claim, claimId: string, lng: string) => {
  if (claim.getHowToProceed()) {
    return summarySection({
      title: t('PAGES.CHECK_YOUR_ANSWER.HOW_DO_YOU_WISH_TO_PROCEED', { lng }),
      summaryRows: [buildSummaryQuestionForChooseHowToProceed(claim, claimId, lng)],
    });
  }
};
