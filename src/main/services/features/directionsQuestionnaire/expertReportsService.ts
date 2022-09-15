import {ExpertReports} from '../../../common/models/directionsQuestionnaire/expertReports';
import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {ExpertReportsOptions} from "../../../common/models/directionsQuestionnaire/expertReportsOptions";

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('DQ - Sent Expert Reports');

const getExpertReports = async (claimId: string): Promise<ExpertReports> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    return caseData?.directionQuestionnaire?.expertReports ? caseData.directionQuestionnaire.expertReports : new ExpertReports();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const getExpertReportsForm = (expertReports: ExpertReportsOptions): ExpertReports => {
  return new ExpertReports(expertReports);
};

const saveExpertReports = async (claimId: string, expertReports: ExpertReports) => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    caseData.directionQuestionnaire = {...caseData.directionQuestionnaire};
    caseData.directionQuestionnaire.expertReports = expertReports;

    await saveDraftClaim(claimId, caseData);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getExpertReports,
  getExpertReportsForm,
  saveExpertReports,
};
