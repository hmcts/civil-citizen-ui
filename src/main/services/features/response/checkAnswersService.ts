import {SummarySection, summarySection, SummarySections} from '../../../common/models/summaryList/summarySections';
import {Claim} from '../../../common/models/claim';
import {SummaryRow, summaryRow} from '../../../common/models/summaryList/summaryList';
import {
  CITIZEN_DETAILS_URL,
  CITIZEN_EXPLANATION_URL,
  CITIZEN_PAYMENT_OPTION_URL,
  CITIZEN_PHONE_NUMBER_URL,
  CITIZEN_REPAYMENT_PLAN,
  CITIZEN_RESPONSE_TYPE_URL,
  DOB_URL,
} from '../../../routes/urls';
import {t} from 'i18next';
import {getLng} from '../../../common/utils/languageToggleUtils';
import {PrimaryAddress} from '../../../common/models/primaryAddress';
import {CorrespondenceAddress} from '../../../common/models/correspondenceAddress';
import {formatDateToFullDate} from '../../../common/utils/dateUtils';
import PaymentOptionType from '../../../common/form/models/admission/fullAdmission/paymentOption/paymentOptionType';
import {StatementOfTruthForm} from '../../../common/form/models/statementOfTruth/statementOfTruthForm';
import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('checkAnswersService');

const changeLabel = (lang: string | unknown): string => t('PAGES.CHECK_YOUR_ANSWER.CHANGE', {lng: getLng(lang)});

const addressToString = (address: PrimaryAddress | CorrespondenceAddress) => {
  return address.AddressLine1 + '<br>' + address.PostTown + '<br>' + address.PostCode;
};


const getDefendantFullName = (claim: Claim): string => {
  if (claim.respondent1.individualFirstName && claim.respondent1.individualLastName) {
    return claim.respondent1.individualTitle + ' ' + claim.respondent1.individualFirstName + ' ' + claim.respondent1.individualLastName;
  }
  return claim.respondent1.partyName;
};

const getPaymentOption = (claim: Claim, lang: string | unknown): string => {
  const option = t(`COMMON.PAYMENT_OPTION.${claim.paymentOption}`, {lng: getLng(lang)});
  if (claim.isPaymentOptionBySetDate()) {
    return option + ': ' + formatDateToFullDate(claim.paymentDate);
  }
  return option;
};

const buildSummarySections = (claim: Claim, claimId: string, lang: string | unknown): SummarySections => {
  return {
    sections: [
      buildYourDetailsSection(claim, claimId, lang),
      buildResponseSection(claim, claimId, lang),
    ],
  };
};

const buildExplanationRow = (claim: Claim, claimId: string, lang: string | unknown): SummaryRow => {
  const explanationHref = constructResponseUrlWithIdParams(claimId, CITIZEN_EXPLANATION_URL);
  return summaryRow(t('PAGES.EXPLANATION.TITLE', {lng: getLng(lang)}), claim.statementOfMeans?.explanation?.text, explanationHref, changeLabel(lang));
};

const buildYourDetailsSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const yourDetailsHref = constructResponseUrlWithIdParams(claimId, CITIZEN_DETAILS_URL);
  const phoneNumberHref = constructResponseUrlWithIdParams(claimId, CITIZEN_PHONE_NUMBER_URL);
  const yourDetailsSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.DETAILS_TITLE', {lng: getLng(lang)}),
    summaryRows: [
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FULL_NAME', {lng: getLng(lang)}), getDefendantFullName(claim), yourDetailsHref, changeLabel(lang)),
    ],
  });
  if (claim.respondent1.contactPerson) {
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CONTACT_PERSON', {lng: getLng(lang)}), claim.respondent1.contactPerson, yourDetailsHref, changeLabel(lang)));
  }
  yourDetailsSection.summaryList.rows.push(...[summaryRow(t('PAGES.CHECK_YOUR_ANSWER.ADDRESS', {lng: getLng(lang)}), addressToString(claim.respondent1.primaryAddress), yourDetailsHref, changeLabel(lang)),
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CORRESPONDENCE_ADDRESS', {lng: getLng(lang)}), claim.respondent1.correspondenceAddress ? addressToString(claim.respondent1.correspondenceAddress) : t('PAGES.CHECK_YOUR_ANSWER.SAME_ADDRESS', {lng: getLng(lang)}), yourDetailsHref, changeLabel(lang))]);
  if (claim.respondent1.dateOfBirth) {
    const yourDOBHref = DOB_URL.replace(':id', claimId);
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.DOB', {lng: getLng(lang)}), formatDateToFullDate(claim.respondent1.dateOfBirth), yourDOBHref, changeLabel(lang)));
  }
  yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CONTACT_NUMBER', {lng: getLng(lang)}), claim.respondent1.telephoneNumber, phoneNumberHref, changeLabel(lang)));
  return yourDetailsSection;
};

const buildResponseSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const yourResponseHref = constructResponseUrlWithIdParams(claimId, CITIZEN_RESPONSE_TYPE_URL);
  const paymentOptionHref = constructResponseUrlWithIdParams(claimId, CITIZEN_PAYMENT_OPTION_URL);
  const responseSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_TITLE', {lng: getLng(lang)}),
    summaryRows: [
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.OWE_MONEY', {lng: getLng(lang)}), t(`COMMON.RESPONSE_TYPE.${claim.respondent1.responseType}`, {lng: getLng(lang)}), yourResponseHref, changeLabel(lang)),
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY', {lng: getLng(lang)}), getPaymentOption(claim, lang), paymentOptionHref, changeLabel(lang)),
    ],
  });
  switch (claim.paymentOption) {
    case PaymentOptionType.BY_SET_DATE:
      responseSection.summaryList.rows.push(buildExplanationRow(claim, claimId, lang));
      break;
    case PaymentOptionType.INSTALMENTS: {
      const repaymentPlanHref = constructResponseUrlWithIdParams(claimId, CITIZEN_REPAYMENT_PLAN);
      responseSection.summaryList.rows.push(...[
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.REGULAR_PAYMENTS', {lng: getLng(lang)}), `£${claim.repaymentPlan.paymentAmount}`, repaymentPlanHref, changeLabel(lang)),
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.PAYMENT_FREQUENCY', {lng: getLng(lang)}), t(`COMMON.PAYMENT_FREQUENCY.${claim.repaymentPlan.repaymentFrequency}`, {lng: getLng(lang)}), repaymentPlanHref, changeLabel(lang)),
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FIRST_PAYMENT', {lng: getLng(lang)}), formatDateToFullDate(claim.repaymentPlan.firstRepaymentDate), repaymentPlanHref, changeLabel(lang)),
        buildExplanationRow(claim, claimId, lang),
      ]);
    }
  }
  return responseSection;
};

export const getSummarySections = (claimId: string, claim: Claim, lang?: string | unknown): SummarySections => {
  return buildSummarySections(claim, claimId, lang);
};

export const getStatementOfTruth = (claim: Claim) => {
  if (claim.defendantStatementOfTruth) {
    return claim.defendantStatementOfTruth;
  }
  return new StatementOfTruthForm();
};

export const saveStatementOfTruth = async (claimId: string, defendantStatementOfTruth: StatementOfTruthForm) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    claim.defendantStatementOfTruth = defendantStatementOfTruth;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
