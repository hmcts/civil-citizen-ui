import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {YesNo} from '../../../common/form/models/yesNo';
import {
  ExpertReportDetails,
} from '../../../common/models/directionsQuestionnaire/experts/expertReportDetails/expertReportDetails';
import {ReportDetail} from '../../../common/models/directionsQuestionnaire/experts/expertReportDetails/reportDetail';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('expertReportDetailsService');

export const getExpertReportDetails = async (claimId: string): Promise<ExpertReportDetails> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    if (caseData.isDefendantNotResponded() && caseData.directionQuestionnaire?.experts?.expertReportDetails) {
      caseData.directionQuestionnaire.experts.expertReportDetails.reportDetails =
        caseData.directionQuestionnaire.experts.expertReportDetails.reportDetails?.map(reportDetail => ReportDetail.fromJson(reportDetail));
      return caseData.directionQuestionnaire.experts.expertReportDetails;
    }
    if (caseData.isClaimantIntentionPending() && caseData.claimantResponse?.directionQuestionnaire?.experts?.expertReportDetails) {
      caseData.claimantResponse.directionQuestionnaire.experts.expertReportDetails.reportDetails =
        caseData.claimantResponse.directionQuestionnaire.experts.expertReportDetails.reportDetails?.map(reportDetail => ReportDetail.fromJson(reportDetail));
      return caseData.claimantResponse.directionQuestionnaire.experts.expertReportDetails;
    }
    return new ExpertReportDetails();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getExpertReportDetailsForm = (option: YesNo, reportDetails: Record<string, string>[]): ExpertReportDetails => {
  const reportDetailsForm = (option === YesNo.NO) ? undefined : reportDetails;
  const form = reportDetailsForm?.map((reportDetail: Record<string, string>) => ReportDetail.fromObject(reportDetail));
  if (option) {
    return new ExpertReportDetails(option, form);
  }
  return new ExpertReportDetails(undefined, [new ReportDetail('', '', '', '')]);
};
