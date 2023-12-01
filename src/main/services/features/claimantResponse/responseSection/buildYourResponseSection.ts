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

export const buildFDDisputeTheClaimSummaryRows = (claim: Claim, claimId: string, lang : string) : SummaryRow =>{
  const intentionToProceedHref = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_INTENTION_TO_PROCEED_URL);
  const intentionToProceed = claim.claimantResponse?.intentionToProceed?.option === YesNo.YES ? YesNoUpperCase.YES : YesNoUpperCase.NO;
  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.PROCEED_WITH_CLAIM', {lang}),
    t(`COMMON.${intentionToProceed}`, {lang}),
    intentionToProceedHref,
    changeLabel(lang));
};

export const buildPartAdmitPayImmediatelySummaryRows = (claim: Claim, claimId: string, lang : string) : SummaryRow =>{
  const partAdmitAcceptedHref = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL);
  const selectedOption = claim.claimantResponse?.hasPartAdmittedBeenAccepted?.option as YesNo;
  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.DO_YOU_ACCEPT_OR_REJECT_THE_DEFENDANTS_ADMISSION', {lang}),
    t(RESPONSEFORNOTPAIDPAYIMMEDIATELY[selectedOption], {lang}),
    partAdmitAcceptedHref,
    changeLabel(lang));

};

export const buildSummaryQuestionForDefendantRepaymentPlan = (claim: Claim, claimId: string, lang: string): SummaryRow => {
  const pageRef = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_ACCEPT_REPAYMENT_PLAN_URL);
  const selectedOption = claim.claimantResponse?.fullAdmitSetDateAcceptPayment?.option as YesNo;
  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.DO_YOU_ACCEPT_THE_DEFENDANT_REPAYMENT_PLAN', { lang }),
    t(RESPONSEFORDEFENDANTREPAYMENTPLAN[selectedOption], { lang }),
    pageRef,
    changeLabel(lang));
};

export const buildHowDoYourWantToProceed = (claim: Claim, claimId: string, lang: string): SummaryRow => {
  const partAdmitAcceptedHref = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL);
  const selectedOption = claim.claimantResponse?.chooseHowToProceed?.option;
  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.HOW_DO_WANT_TO_FORMALISE_REPAYMENT_PLAN', {lang}),
    t(RESPONSFORCYAFORCHOOSEHOWTOPROCEED[selectedOption], {lang}),
    partAdmitAcceptedHref,
    changeLabel(lang));

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

export const buildSummaryQuestionForChooseHowToProceed = (claim: Claim, claimId: string, lang: string) => {
  const selectedOption = claim.claimantResponse?.chooseHowToProceed?.option;
  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.HOW_DO_YOU_WANT_TO_FORMALISE_THE_REPAYMENT_PLAN', { lang }),
    t(RESPONSFORCYAFORCHOOSEHOWTOPROCEED[selectedOption], { lang }),
    constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL),
    changeLabel(lang));
};

export const buildYourResponseSection = (claim: Claim, claimId: string, lang: string): SummarySection => {
  const claimantResponse = claim.claimantResponse;
  const yourResponse = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE', {lang}),
    summaryRows: [],
  });

  if (claim.isPartialAdmission() && claimantResponse.hasPartAdmittedBeenAccepted?.option) {
    yourResponse.summaryList.rows.push(buildPartAdmitPayImmediatelySummaryRows(claim, claimId, lang));
  }

  if (claimantResponse.hasDefendantPaidYou?.option) {
    yourResponse.summaryList.rows.push(getDoYouAgreeDefendantPaid(claim, claimId, lang));
  }

  if (claimantResponse.hasPartPaymentBeenAccepted?.option) {
    yourResponse.summaryList.rows.push(getDoYouWantToSettlePaid(claim, claimId, lang));
  }

  if (claim.isRejectionReasonCompleted()) {
    yourResponse.summaryList.rows.push(getReasonForRejecting(claim, claimId, lang));
  }

  if (claim.isRejectAllOfClaimDispute()) {
    yourResponse.summaryList.rows.push(buildFDDisputeTheClaimSummaryRows(claim, claimId, lang));
  }

  if (claim.isClaimantRejectedPaymentPlan) {
    if (claimantResponse.fullAdmitSetDateAcceptPayment?.option) {
      yourResponse.summaryList.rows.push(buildSummaryQuestionForDefendantRepaymentPlan(claim, claimId, lang));
    }
    if (claim.claimantResponse.fullAdmitSetDateAcceptPayment?.option === YesNo.YES) {
      yourResponse.summaryList.rows.push(buildHowDoYourWantToProceed(claim, claimId, lang));
    }
    if (claim.claimantResponse.suggestedPaymentIntention?.paymentOption === PaymentOptionType.IMMEDIATELY) {
      yourResponse.summaryList.rows.push(buildFullAdmitPayImmediatelySummaryRows(claim, claimId, lang));
    }
    if (claim.claimantResponse.suggestedPaymentIntention?.paymentOption === PaymentOptionType.INSTALMENTS) {
      yourResponse.summaryList.rows.push(...buildPartAdmitPayInstallmentsSummaryRows(claim, claimId, lang));
    }

    if (claim.claimantResponse.suggestedPaymentIntention?.paymentOption === PaymentOptionType.BY_SET_DATE) {
      yourResponse.summaryList.rows.push(...buildPartAdmitPaySetDateSummaryRows(claim, claimId, lang));
    }
  }

  return yourResponse;
};

export const buildHowYouWishToProceed = (claim: Claim, claimId: string, lang: string) => {
  const claimantResponse = claim.claimantResponse;
  if (claimantResponse.chooseHowToProceed?.option) {
    return summarySection({
      title: t('PAGES.CHECK_YOUR_ANSWER.HOW_DO_YOU_WISH_TO_PROCEED', { lang }),
      summaryRows: [buildSummaryQuestionForChooseHowToProceed(claim, claimId, lang)],
    });
  }
};
