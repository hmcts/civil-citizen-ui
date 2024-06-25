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
    if (caseData.isClaimantIntentionPending() && caseData.claimantResponse?.directionQuestionnaire?.experts?.expertReportDetails) {
      caseData.claimantResponse.directionQuestionnaire.experts.expertReportDetails.reportDetails =
        caseData.claimantResponse.directionQuestionnaire.experts.expertReportDetails.reportDetails?.map(reportDetail => ReportDetail.fromJson(reportDetail));
      return caseData.claimantResponse.directionQuestionnaire.experts.expertReportDetails;
    }

    if (!caseData.isClaimantIntentionPending() && caseData.directionQuestionnaire?.experts?.expertReportDetails) {
      caseData.directionQuestionnaire.experts.expertReportDetails.reportDetails =
        caseData.directionQuestionnaire.experts.expertReportDetails.reportDetails?.map(reportDetail => ReportDetail.fromJson(reportDetail));
      return caseData.directionQuestionnaire.experts.expertReportDetails;
    }
    return new ExpertReportDetails(caseData.isClaimant());
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getExpertReportDetailsForm = (isClaimant: boolean, option: YesNo, reportDetails: Record<string, string>[]): ExpertReportDetails => {
  const reportDetailsForm = (option === YesNo.NO) ? undefined : reportDetails;
  const form = reportDetailsForm?.map((reportDetail: Record<string, string>) => ReportDetail.fromObject(reportDetail));
  if (option) {
    return new ExpertReportDetails(isClaimant, option, form);
  }
  return new ExpertReportDetails(isClaimant, undefined, [new ReportDetail('', '', '', '')]);
};
