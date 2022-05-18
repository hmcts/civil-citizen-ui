import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {SummarySection, summarySection, SummarySections} from '../../../common/models/summaryList/summarySections';
import {Claim} from '../../../common/models/claim';
import {summaryRow} from '../../../common/models/summaryList/summaryList';
import {
  CITIZEN_DETAILS_URL,
  CITIZEN_PAYMENT_OPTION_URL,
  CITIZEN_PHONE_NUMBER_URL,
  CITIZEN_RESPONSE_TYPE_URL,
} from '../../../routes/urls';
import {t} from 'i18next';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('checkAnswersService');

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
  return summarySection({
    title: t('CHECK_YOUR_ANSWER.DETAILS_TITLE', {lng: lang ? String(lang) : 'en'}),
    summaryRows: [
      summaryRow(t('CHECK_YOUR_ANSWER.FULL_NAME', {lng: lang ? String(lang) : 'en'}), claim.respondent1.partyName, yourDetailsHref, 'Change'),
      summaryRow(t('CHECK_YOUR_ANSWER.CONTACT_NUMBER', {lng: lang ? String(lang) : 'en'}), claim.respondent1.telephoneNumber, phoneNumberHref, 'Change'),
    ],
  });
};

const buildResponseSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const yourResponseHref = CITIZEN_RESPONSE_TYPE_URL.replace(':id', claimId);
  const paymentOptionHref = CITIZEN_PAYMENT_OPTION_URL.replace(':id', claimId);
  return summarySection({
    title: t('CHECK_YOUR_ANSWER.RESPONSE_TITLE', {lng: lang ? String(lang) : 'en'}),
    summaryRows: [
      summaryRow(t('CHECK_YOUR_ANSWER.OWE_MONEY', {lng: lang ? String(lang) : 'en'}), t(claim.respondent1.responseType, {lng: lang ? String(lang) : 'en'}), yourResponseHref, 'Change'),
      summaryRow(t('CHECK_YOUR_ANSWER.WHEN_PAY', {lng: lang ? String(lang) : 'en'}), t(claim.paymentOption, {lng: lang ? String(lang) : 'en'}), paymentOptionHref, 'Change'),
    ],
  });
};

export const getSummarySections = async (claimId: string, lang?: string | unknown): Promise<SummarySections> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    return buildSummarySections(claim, claimId, lang);
  } catch (error) {
    logger.error(`${(error as Error).stack || error}`);
    throw error;
  }
};
