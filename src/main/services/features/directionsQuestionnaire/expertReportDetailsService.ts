import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {YesNo} from '../../../common/form/models/yesNo';
import {ExpertReportDetails} from '../../../common/models/directionsQuestionnaire/expertReportDetails/expertReportDetails';
import {DirectionQuestionnaire} from '../../../common/models/directionsQuestionnaire/directionQuestionnaire';
import {ReportDetail} from 'common/models/directionsQuestionnaire/expertReportDetails/reportDetail';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('expertReportDetailsService');

export const getExpertReportDetails = async (claimId: string): Promise<ExpertReportDetails> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    if (caseData.directionQuestionnaire?.expertReportDetails) {
      const reportDetails = caseData.directionQuestionnaire.expertReportDetails.reportDetails?.map(reportDetail => {
        const reportDate = new Date(reportDetail.reportDate);
        return new ReportDetail(
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

export const getExpertReportDetailsForm = (hasExpertReports: YesNo, reportDetails: ReportDetail[]): ExpertReportDetails => {
  // TODO : emptyform reportDetail
  const reportDetailsForm = (hasExpertReports === YesNo.NO) ? [new ReportDetail()] : reportDetails;
  const form = reportDetailsForm?.map(reportDetail =>
    new ReportDetail(
      reportDetail.expertName,
      reportDetail.year.toString(),
      reportDetail.month.toString(),
      reportDetail.day.toString(),
    ),
  );

  if (hasExpertReports) {
    return new ExpertReportDetails(hasExpertReports, form);
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