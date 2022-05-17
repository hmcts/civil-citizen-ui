import {
  getCaseDataFromStore,
} from '../../../modules/draft-store/draftStoreService';
import {
  summarySection,
  SummarySections,
} from '../../../common/models/summaryList/summarySections';
import {Claim} from '../../../common/models/claim';
import {summaryRow} from '../../../common/models/summaryList/summaryList';
import {
  CITIZEN_DETAILS_URL,
  CITIZEN_PHONE_NUMBER_URL,
  CITIZEN_RESPONSE_TYPE_URL,
} from '../../../routes/urls';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('checkAnswersService');

const buildSummarySections = (claim: Claim, claimId: string): SummarySections => {

  const yourDetailsHref = CITIZEN_DETAILS_URL.replace(':id', claimId);
  const phoneNumberHref = CITIZEN_PHONE_NUMBER_URL.replace(':id', claimId);
  const yourDetailsSection = summarySection({
    title: 'Your details',
    summaryRows: [
      summaryRow('Full name', claim.respondent1.partyName, yourDetailsHref, 'Change'),
      summaryRow('Contact number (optional)', claim.respondent1.telephoneNumber, phoneNumberHref, 'Change'),
    ],
  });

  const yourResponseHref = CITIZEN_RESPONSE_TYPE_URL.replace(':id', claimId);
  const yourResponseSection = summarySection({
    title: 'Your response to the claim',
    summaryRows: [
      summaryRow('Do you owe the money claimed', claim.respondent1.responseType, yourResponseHref, 'Change'),
      summaryRow('When will you pay', 'Screen still to be developped', '#', 'Change'),
    ],
  });
  return {
    sections: [
      yourDetailsSection,
      yourResponseSection,
    ],
  };
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
