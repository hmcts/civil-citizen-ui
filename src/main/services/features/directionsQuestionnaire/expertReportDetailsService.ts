import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {YesNo} from '../../../common/form/models/yesNo';
import {ExpertReportDetails} from '../../../common/models/directionsQuestionnaire/experts/expertReportDetails/expertReportDetails';
import {DirectionQuestionnaire} from '../../../common/models/directionsQuestionnaire/directionQuestionnaire';
import {ReportDetail} from '../../../common/models/directionsQuestionnaire/experts/expertReportDetails/reportDetail';
import {Experts} from '../../../common/models/directionsQuestionnaire/experts/experts';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('expertReportDetailsService');

export const getExpertReportDetails = async (claimId: string): Promise<ExpertReportDetails> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    if (caseData.directionQuestionnaire?.experts?.expertReportDetails) {
      const reportDetails = caseData.directionQuestionnaire.experts.expertReportDetails.reportDetails?.map(reportDetail => ReportDetail.fromJson(reportDetail));
      caseData.directionQuestionnaire.experts.expertReportDetails.reportDetails = reportDetails;
      return caseData.directionQuestionnaire.experts.expertReportDetails;
    }
    return new ExpertReportDetails();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getExpertReportDetailsForm = (hasExpertReports: YesNo, reportDetails: Record<string, string>[]): ExpertReportDetails => {
  const reportDetailsForm = (hasExpertReports === YesNo.NO) ? undefined : reportDetails;
  const form = reportDetailsForm?.map((reportDetail: Record<string, string>) => ReportDetail.fromObject(reportDetail));
  if (hasExpertReports) {
    return new ExpertReportDetails(hasExpertReports, form);
  }
  return ExpertReportDetails.buildEmptyForm();
};

export const saveExpertReportDetails = async (claimId: string, expertReportDetails: ExpertReportDetails) => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    if (!caseData.directionQuestionnaire) {
      caseData.directionQuestionnaire = new DirectionQuestionnaire();
    }
    if (!caseData.directionQuestionnaire.experts) {
      caseData.directionQuestionnaire.experts = new Experts();
    }
    caseData.directionQuestionnaire.experts.expertReportDetails = ExpertReportDetails.removeEmptyReportDetails(expertReportDetails);
    await saveDraftClaim(claimId, caseData);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};