import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {SummarySection, summarySection, SummarySections} from '../../../common/models/summaryList/summarySections';
import {Claim} from '../../../common/models/claim';
import {summaryRow} from '../../../common/models/summaryList/summaryList';
import {
  CITIZEN_DETAILS_URL,
  CITIZEN_PAYMENT_OPTION_URL,
  CITIZEN_PHONE_NUMBER_URL,
  CITIZEN_RESPONSE_TYPE_URL,
  DOB_URL,
} from '../../../routes/urls';
import {t} from 'i18next';
import {getLng} from '../../../common/utils/languageToggleUtils';
import {PrimaryAddress} from '../../../common/models/primaryAddress';
import {CorrespondenceAddress} from '../../../common/models/correspondenceAddress';
import {formatDateToFullDate} from '../../../common/utils/dateUtils';
import {StatementOfTruthForm} from '../../../common/form/models/statementOfTruth/statementOfTruthForm';

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
  if (claim.respondent1.contactPerson) {
    return claim.respondent1.contactPerson;
  }
  return claim.respondent1.partyName;
};

const buildSummarySections = (claim: Claim, claimId: string, lang: string | unknown): SummarySections => {
  return {
    sections: [
      buildYourDetailsSection(claim, claimId, lang),
      buildResponseSection(claim, claimId, lang),
    ],
  };
};

const buildYourDetailsSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const yourDetailsHref = CITIZEN_DETAILS_URL.replace(':id', claimId);
  const phoneNumberHref = CITIZEN_PHONE_NUMBER_URL.replace(':id', claimId);
  const yourDetailsSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.DETAILS_TITLE', {lng: getLng(lang)}),
    summaryRows: [
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FULL_NAME', {lng: getLng(lang)}), getDefendantFullName(claim), yourDetailsHref, changeLabel(lang)),
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.ADDRESS', {lng: getLng(lang)}), addressToString(claim.respondent1.primaryAddress), yourDetailsHref, changeLabel(lang)),
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CORRESPONDENCE_ADDRESS', {lng: getLng(lang)}), claim.respondent1.correspondenceAddress ? addressToString(claim.respondent1.correspondenceAddress) : t('PAGES.CHECK_YOUR_ANSWER.SAME_ADDRESS', {lng: getLng(lang)}), yourDetailsHref, changeLabel(lang)),
    ],
  });
  if (claim.respondent1.dateOfBirth) {
    const yourDOBHref = DOB_URL.replace(':id', claimId);
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.DOB', {lng: getLng(lang)}), formatDateToFullDate(claim.respondent1.dateOfBirth), yourDOBHref, changeLabel(lang)));
  }
  yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CONTACT_NUMBER', {lng: getLng(lang)}), claim.respondent1.telephoneNumber, phoneNumberHref, changeLabel(lang)));
  return yourDetailsSection;
};

const buildResponseSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const yourResponseHref = CITIZEN_RESPONSE_TYPE_URL.replace(':id', claimId);
  const paymentOptionHref = CITIZEN_PAYMENT_OPTION_URL.replace(':id', claimId);
  return summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_TITLE', {lng: getLng(lang)}),
    summaryRows: [
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.OWE_MONEY', {lng: getLng(lang)}), t(`COMMON.RESPONSE_TYPE.${claim.respondent1.responseType}`, {lng: getLng(lang)}), yourResponseHref, changeLabel(lang)),
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY', {lng: getLng(lang)}), t(`COMMON.PAYMENT_OPTION.${claim.paymentOption}`, {lng: getLng(lang)}), paymentOptionHref, changeLabel(lang)),
    ],
  });
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
