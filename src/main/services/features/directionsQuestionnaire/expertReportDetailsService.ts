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
      const reportDetails = caseData.directionQuestionnaire.expertReportDetails.reportDetails.map(reportDetail => {
        const reportDate = new Date(reportDetail.reportDate);
        return new ReportDetails(
          reportDetail.expertName,
          reportDate.getFullYear().toString(),
          (reportDate.getMonth() + 1).toString(),
          reportDate.getDate().toString(),
        );
      });
      caseData.directionQuestionnaire.expertReportDetails.reportDetails = reportDetails;
      return caseData.directionQuestionnaire?.expertReportDetails;
    }
    return ExpertReportDetails.buildEmptyForm();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getExpertReportDetailsForm = (hasExpertReports: YesNo, reportDetails: ReportDetails[]): ExpertReportDetails => {
  const details = (hasExpertReports === YesNo.NO) ? [new ReportDetails()] : reportDetails;
  const reportDetailsForm = details?.map(detail =>
    new ReportDetails(
      detail.expertName,
      detail.year.toString(),
      detail.month.toString(),
      detail.day.toString(),
    ),
  );
  if (hasExpertReports) {
    return new ExpertReportDetails(hasExpertReports, reportDetailsForm);
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
    await saveDraftClaim(claimId, caseData);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};