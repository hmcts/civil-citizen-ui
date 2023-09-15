import { SummarySection, SummarySections, summarySection } from 'common/models/summaryList/summarySections';
import {Claim} from 'common/models/claim';
import {StatementOfTruthForm} from 'common/form/models/statementOfTruth/statementOfTruthForm';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {ClaimantResponse} from 'common/models/claimantResponse';
import { t } from 'i18next';
import { summaryRow } from 'common/models/summaryList/summaryList';
import { constructResponseUrlWithIdParams } from 'common/utils/urlFormatter';
import { CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL } from 'routes/urls';
import { changeLabel } from 'common/utils/checkYourAnswer/changeButton';
import { formatDateToFullDate } from 'common/utils/dateUtils';
import { getAmount, getFinalPaymentDate, getFirstRepaymentDate, getPaymentAmount, getPaymentDate, getRepaymentFrequency } from 'common/utils/repaymentUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseCheckAnswersService');

const buildSummarySections = (claimId: string, claim: Claim, lang?: string | unknown): SummarySections => {
  return {
    sections: [
    // TODO : This part will be developed as part of other future tasks for different scenarios
      buildDetailsSection(claim, claimId, lang),
    ],
  };
};

const buildDetailsSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const isSignSettlement = claim.isSignASettlementAgreement();
  const isPayBySetDate = isSignSettlement && (claim.isPAPaymentOptionByDate() || claim.isFAPaymentOptionBySetDate());
  const isPaymentOptionByInstallments = isSignSettlement && (claim.isPAPaymentOptionInstallments() || claim.isFAPaymentOptionInstallments());

  if (isSignSettlement && isPayBySetDate)
    return buildSummaryForPayBySetDate(claim, claimId, lang);

  if (isSignSettlement && isPaymentOptionByInstallments)
    return buildSummaryForPayByInstallments(claim, claimId, lang);
};

const buildSummaryForPayBySetDate = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const paymentDate = formatDateToFullDate(getPaymentDate(claim));
  const fullName = claim.getDefendantFullName();
  const amount = getAmount(claim);
  return summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.SETTLEMENT_AGREEMENT', { lang }),
    summaryRows: [
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA', { lang }), t('PAGES.CHECK_YOUR_ANSWER.WILL_PAY_BY_PAYMENT_DATE', { fullName, amount, paymentDate, lang }), constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL), changeLabel(lang as string)),
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA', { lang }), `${paymentDate}`),
    ],
  });
};

const buildSummaryForPayByInstallments = (claim: Claim, claimId: string, lang: string | unknown) => {
  const fullName = claim.getDefendantFullName();
  const amount = getAmount(claim);
  const instalmentAmount = getPaymentAmount(claim);
  const frequency = t(`COMMON.PAYMENT_FREQUENCY.${getRepaymentFrequency(claim)}`, { lang })?.toLowerCase();
  const instalmentDate = formatDateToFullDate(getFirstRepaymentDate(claim));
  return summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.SETTLEMENT_AGREEMENT', { lang }),
    summaryRows: [
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.THE_AGREEMENT_CYA', { lang }), t('PAGES.CHECK_YOUR_ANSWER.WILL_REPAY_IN_INSTALLMENTS', { lang, fullName, amount, instalmentAmount, instalmentDate, frequency }), constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL), changeLabel(lang as string)),
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COMPLETION_DATE_CYA', { lang }), `${formatDateToFullDate(getFinalPaymentDate(claim))}`),
    ],
  });
};

export const getSummarySections = (claimId: string, claim: Claim, lang?: string | unknown): SummarySections => {
  return buildSummarySections(claimId, claim, lang);
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
