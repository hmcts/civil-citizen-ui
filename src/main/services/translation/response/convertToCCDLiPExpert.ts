import {Experts} from 'models/directionsQuestionnaire/experts/experts';
import {toCCDYesNo, toCCDYesNoFromBoolean} from 'services/translation/response/convertToCCDYesNo';
import {ReportDetail} from 'models/directionsQuestionnaire/experts/expertReportDetails/reportDetail';
import {YesNo} from 'form/models/yesNo';

export const toCCDLiPExpert = (expert: Experts | undefined) => {
  return {
    caseNeedsAnExpert: toCCDYesNoFromBoolean(expert?.expertRequired),
    expertCanStillExamineDetails: expert?.expertCanStillExamine?.option == YesNo.YES ? expert?.expertCanStillExamine?.details : '',
    expertReportRequired: toCCDYesNo(expert?.expertReportDetails?.option),
    details: expert?.expertReportDetails?.option == YesNo.YES ? toCCDReportDetailItem(expert?.expertReportDetails?.reportDetails) : undefined,
  };
};

const toCCDReportDetailItem = (reportDetails: ReportDetail[]) => {
  const reportList = reportDetails?.map((reportDetail: ReportDetail) => {
    return {
      value: {
        expertName: reportDetail.expertName,
        reportDate: reportDetail.reportDate,
      },
    };
  });
  return reportList ?? undefined;
};
