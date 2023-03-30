import {Experts} from 'models/directionsQuestionnaire/experts/experts';
import {
  toCCDYesNo,
} from 'services/translation/response/convertToCCDYesNo';
import {ReportDetail} from 'models/directionsQuestionnaire/experts/expertReportDetails/reportDetail';
import {YesNo} from 'form/models/yesNo';

export const toCCDLiPExpert = (expert: Experts | undefined) => {
  return {
    expertCanStillExamine: toCCDYesNo(expert?.expertCanStillExamine?.option),
    expertCanStillExamineDetails: expert?.expertCanStillExamine?.option == YesNo.YES ? expert?.expertCanStillExamine?.details : '',
    expertReportRequired: toCCDYesNo(expert?.expertReportDetails?.option),
    reportDetails: toCCDReportDetailItem(expert?.expertReportDetails?.reportDetails),
  };
};

function toCCDReportDetailItem(reportDetails: ReportDetail[]) {
  if (reportDetails?.length) {
    return reportDetails.map((reportDetail: ReportDetail) => {
      return {
        value: {
          expertName: reportDetail.expertName,
          reportDate: reportDetail.reportDate,
        },
      };
    });
  }
}
