import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {YesNo} from '../../../common/form/models/yesNo';
import {ExpertReportDetails} from '../../../common/models/directionsQuestionnaire/expertReportDetails/expertReportDetails';
import {DirectionQuestionnaire} from '../../../common/models/directionsQuestionnaire/directionQuestionnaire';
import {ReportDetails} from 'common/models/directionsQuestionnaire/expertReportDetails/reportDetails';

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

export const getExpertReportDetailsForm = (hasExpertReports: YesNo, reportDetails: ReportDetails[]): ExpertReportDetails => {
  // TODO : fix this part
  const expertReportDetails = (hasExpertReports === YesNo.NO) ? [new ReportDetails()] : reportDetails;
  return (hasExpertReports) ?
    new ExpertReportDetails(hasExpertReports, expertReportDetails) :
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