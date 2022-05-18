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

const buildSummarySections = (claim: Claim, claimId: string): SummarySections => {
  return {
    sections: [
      buildYourDetailsSection(claim, claimId),
      buildResponseSection(claim, claimId),
    ],
  };
};

const buildYourDetailsSection = (claim: Claim, claimId: string): SummarySection => {
  const yourDetailsHref = CITIZEN_DETAILS_URL.replace(':id', claimId);
  const phoneNumberHref = CITIZEN_PHONE_NUMBER_URL.replace(':id', claimId);
  return summarySection({
    title: 'Your details',
    summaryRows: [
      summaryRow('Full name', claim.respondent1.partyName, yourDetailsHref, 'Change'),
      summaryRow('Contact number (optional)', claim.respondent1.telephoneNumber, phoneNumberHref, 'Change'),
    ],
  });
};

const buildResponseSection = (claim: Claim, claimId: string): SummarySection => {
  const yourResponseHref = CITIZEN_RESPONSE_TYPE_URL.replace(':id', claimId);
  const paymentOptionHref = CITIZEN_PAYMENT_OPTION_URL.replace(':id', claimId);
  return summarySection({
    title: 'Your response to the claim',
    summaryRows: [
      summaryRow(t('Do you owe the money claimed'), t(claim.respondent1.responseType), yourResponseHref, 'Change'),
      summaryRow(t('When will you pay'), t(claim.paymentOption), paymentOptionHref, 'Change'),
    ],
  });
};

export const getSummarySections = async (claimId: string): Promise<SummarySections> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    return buildSummarySections(claim, claimId);
  } catch (error) {
    logger.error(`${(error as Error).stack || error}`);
    throw error;
  }
};
