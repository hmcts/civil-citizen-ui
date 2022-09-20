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
    if (caseData.directionQuestionnaire?.expertReportDetails) {
      const xxx = caseData.directionQuestionnaire.expertReportDetails.reportDetails.map(details => {
        // TODO : convert to setDate
        const date = new Date(details.reportDate);

        return ({
          ...details,
          day: date.getDate(),
          month: date.getMonth() + 1,
          year: date.getFullYear(),
        });
      });
      caseData.directionQuestionnaire.expertReportDetails.reportDetails = xxx;
      return caseData.directionQuestionnaire?.expertReportDetails;

    }
    return new ExpertReportDetails();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getExpertReportDetailsForm = (hasExpertReports: YesNo, reportDetails: ReportDetails[]): ExpertReportDetails => {
  // TODO : fix this part
  const expertReportDetails = (hasExpertReports === YesNo.NO) ? [new ReportDetails()] : reportDetails;
  if (hasExpertReports) {
    return new ExpertReportDetails(hasExpertReports, expertReportDetails);
  }
  return new ExpertReportDetails();
};

export const saveExpertReportDetails = async (claimId: string, expertReportDetails: ExpertReportDetails) => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    if (!caseData.directionQuestionnaire) {
      caseData.directionQuestionnaire = new DirectionQuestionnaire();
    }
    caseData.directionQuestionnaire.expertReportDetails = expertReportDetails;
    console.log('save---', caseData.directionQuestionnaire.expertReportDetails);
    await saveDraftClaim(claimId, caseData);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};