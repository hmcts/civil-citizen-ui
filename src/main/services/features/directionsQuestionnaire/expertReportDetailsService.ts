import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {YesNo} from '../../../common/form/models/yesNo';
import {ExpertReportDetails} from '../../../common/models/directionsQuestionnaire/expertReportDetails';
import {DirectionQuestionnaire} from '../../../common/models/directionsQuestionnaire/directionQuestionnaire';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('expertReportDetailsService');

export const getExpertReportDetails = async (claimId: string): Promise<ExpertReportDetails> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    return caseData.directionQuestionnaire?.expertReportDetails ? caseData.directionQuestionnaire.expertReportDetails :  new ExpertReportDetails();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getExpertReportDetailsForm = (hasExpertReports: YesNo, details: string): ExpertReportDetails => {
  const considerClaimantDocumentsDetails = (hasExpertReports === YesNo.NO) ? '' : details;
  return (hasExpertReports) ?
    new ExpertReportDetails(hasExpertReports, considerClaimantDocumentsDetails) :
    new ExpertReportDetails();
};

export const saveExpertReportDetails = async (claimId: string, expertReportDetails: ExpertReportDetails) => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    if (caseData.directionQuestionnaire) {
      caseData.directionQuestionnaire = {...caseData.directionQuestionnaire, expertReportDetails};
    } else {
      caseData.directionQuestionnaire = {...new DirectionQuestionnaire(), expertReportDetails};
    }
    console.log('save---', caseData.directionQuestionnaire)
    await saveDraftClaim(claimId, caseData);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};