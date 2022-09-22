import {SentExpertReports} from '../../../common/models/directionsQuestionnaire/sentExpertReports';
import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {YesNoNotReceived} from '../../../common/form/models/yesNo';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('DQ - Sent Expert Reports');

const getSentExpertReports = async (claimId: string): Promise<SentExpertReports> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    return caseData?.directionQuestionnaire?.sentExpertReports ? caseData.directionQuestionnaire.sentExpertReports : new SentExpertReports();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const getSentExpertReportsForm = (sentExpertReports: YesNoNotReceived): SentExpertReports => {
  return new SentExpertReports(sentExpertReports);
};

const saveSentExpertReports = async (claimId: string, sentExpertReports: SentExpertReports) => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    caseData.directionQuestionnaire = {...caseData.directionQuestionnaire, sentExpertReports};

    await saveDraftClaim(claimId, caseData);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getSentExpertReports,
  getSentExpertReportsForm,
  saveSentExpertReports,
};
