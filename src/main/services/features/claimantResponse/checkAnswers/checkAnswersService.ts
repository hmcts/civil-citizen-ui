import {SummarySection, SummarySections, summarySection} from 'common/models/summaryList/summarySections';
import {Claim} from 'common/models/claim';
import {StatementOfTruthForm} from 'common/form/models/statementOfTruth/statementOfTruthForm';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {CCJ_EXTENDED_PAID_AMOUNT_URL, CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL, CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL} from 'routes/urls';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {getAmount, getFinalPaymentDate, getFirstRepaymentDate, getPaymentAmount, getPaymentDate, getRepaymentFrequency} from 'common/utils/repaymentUtils';
import {summaryRow} from 'common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from 'common/utils/languageToggleUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {ClaimResponseStatus} from 'common/models/claimResponseStatus';
import {changeLabel} from 'common/utils/checkYourAnswer/changeButton';
import {RESPONSEFORNOTPAIDPAYIMMEDIATELY} from 'common/models/claimantResponse/checkAnswers';
import {buildYourResponseSection} from './buildYourResponseSection';
import {getJudgmentAmountSummary} from '../ccj/judgmentAmountSummaryService';
import {YesNo, YesNoUpperCamelCase} from 'common/form/models/yesNo';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseCheckAnswersService');

const buildSummarySections = (claim: Claim, claimId: string, lang: string | unknown, claimFee?: number): SummarySections => {
  const lng = getLng(lang);
  const getJudgmentRequestSection = () => {
    return claim.isRequestACCJ()
      ? buildJudgmentRequestSection(claim, claimId, lng, claimFee)
      : null;
  };
  const getYourResponseSection = () => {
    return claim.isFullDefence() || claim.isPartialAdmission()
      ? buildYourResponseSection(claim, claimId, lang)
      : null;
  };
  return {
    sections: [
      buildDetailsSection(claim, claimId, lng),
      getJudgmentRequestSection(),
      getYourResponseSection(),
    ],
  };
};

const buildDetailsSection = (claim: Claim, claimId: string, lang: string): SummarySection => {
  const isSignSettlement = claim.isSignASettlementAgreement();
  const isSignSettlementForPayBySetDate = isSignSettlement && (claim.isPAPaymentOptionByDate() || claim.isFAPaymentOptionBySetDate());
  const isSignSettlementForPayByInstallments = isSignSettlement && (claim.isPAPaymentOptionInstallments() || claim.isFAPaymentOptionInstallments());

  if (isSignSettlementForPayBySetDate)
    return buildSummaryForPayBySetDate(claim, claimId, lang);

  if (isSignSettlementForPayByInstallments)
    return buildSummaryForPayByInstallments(claim, claimId, lang);

  if (claim?.responseStatus === ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY)
    return buildSummarySectionForPartAdmitPayImmediately(claim, claimId, lang);
};

const buildJudgmentRequestSection = (claim: Claim, claimId: string, lng: string, claimFee: number): SummarySection => {
  const judgmentSummaryDetails = getJudgmentAmountSummary(claim, claimFee, lng);
  const ccjPaidAmountHref = constructResponseUrlWithIdParams(claimId, CCJ_EXTENDED_PAID_AMOUNT_URL);
  const paymentOption = claim.claimantResponse?.ccjRequest?.paidAmount?.option;

  const judgmentRequestSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.JUDGMENT_REQUEST', {lng}),
    summaryRows: [
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_HAS_DEFENDANT_PAID_SOME', {lng}),
        paymentOption === YesNo.YES ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO, ccjPaidAmountHref, changeLabel(lng)),
    ],
  });
  if (claim.claimantResponse?.ccjRequest?.paidAmount?.amount) {
    judgmentRequestSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_AMOUNT_ALREADY_PAID', {lng}),
      '£' + (judgmentSummaryDetails.alreadyPaidAmount).toFixed(2).toString()));
  }

  if (claim.claimantResponse?.ccjRequest?.paidAmount) {
    judgmentRequestSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CCJ_TOTAL_TO_BE_PAID', {lng}), '£' + judgmentSummaryDetails.total));
  }
  return judgmentRequestSection;
};

const buildSummaryForPayBySetDate = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const paymentDate = formatDateToFullDate(getPaymentDate(claim));
  const fullName = claim.getDefendantFullName();
  const amount = getAmount(claim);
  return summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.SETTLEMENT_AGREEMENT', {lang}),
    summaryRows: [
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA', {lang}), t('PAGES.CHECK_YOUR_ANSWER.WILL_PAY_BY_PAYMENT_DATE', {fullName, amount, paymentDate, lang}), constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL), changeLabel(lang as string)),
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA', {lang}), `${paymentDate}`),
    ],
  });
};

const buildSummaryForPayByInstallments = (claim: Claim, claimId: string, lang: string | unknown) => {
  const fullName = claim.getDefendantFullName();
  const amount = getAmount(claim);
  const instalmentAmount = getPaymentAmount(claim);
  const frequency = t(`COMMON.PAYMENT_FREQUENCY.${getRepaymentFrequency(claim)}`, {lang})?.toLowerCase();
  const instalmentDate = formatDateToFullDate(getFirstRepaymentDate(claim));
  return summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.SETTLEMENT_AGREEMENT', {lang}),
    summaryRows: [
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA', {lang}), t('PAGES.CHECK_YOUR_ANSWER.WILL_REPAY_IN_INSTALLMENTS', {lang, fullName, amount, instalmentAmount, instalmentDate, frequency}), constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL), changeLabel(lang as string)),
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA', {lang}), `${formatDateToFullDate(getFinalPaymentDate(claim))}`),
    ],
  });
};

export const getSummarySections = (claimId: string, claim: Claim, lang?: string | unknown, claimFee?: number): SummarySections => {
  return buildSummarySections(claim, claimId, lang, claimFee);
};

const buildSummarySectionForPartAdmitPayImmediately = (claim: Claim, claimId: string, lang: string | unknown) => {
  const selectedOption = claim?.claimantResponse?.hasPartAdmittedBeenAccepted?.option;
  if (selectedOption) {
    return summarySection({
      title: t('PAGES.CLAIMANT_RESPONSE_TASK_LIST.HEADER', {lang}),
      summaryRows: [
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.DO_YOU_ACCEPT_OR_REJECT_THE_DEFENDANTS_ADMISSION', {lang}), t(RESPONSEFORNOTPAIDPAYIMMEDIATELY[selectedOption], {lang}), constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL), changeLabel(lang as string)),
      ],
    });
  }
};

export const saveStatementOfTruth = async (claimId: string, claimantStatementOfTruth: StatementOfTruthForm) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim.claimantResponse) {
      claim.claimantResponse.claimantStatementOfTruth = claimantStatementOfTruth;
    } else {
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.claimantStatementOfTruth = claimantStatementOfTruth;
    }
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
