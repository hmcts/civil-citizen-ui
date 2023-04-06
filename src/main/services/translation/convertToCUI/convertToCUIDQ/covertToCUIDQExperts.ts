import {YesNoNotReceived} from 'common/form/models/yesNo';
import {
  CCDExpertDetails,
  CCDExportReportSent,
} from 'common/models/ccdResponse/ccdExpert';
import {ExpertDetails} from 'common/models/directionsQuestionnaire/experts/expertDetails';
import {ExpertDetailsList} from 'common/models/directionsQuestionnaire/experts/expertDetailsList';
import {ExpertReportDetails} from 'common/models/directionsQuestionnaire/experts/expertReportDetails/expertReportDetails';
import {SentExpertReports} from 'common/models/directionsQuestionnaire/experts/sentExpertReports';
import {toCUIYesNo} from '../convertToCUIYesNo';
import {
  CCDLiPExpert,
  CCDReportDetail,
} from 'common/models/ccdResponse/ccdLiPExpert';
import {ReportDetail} from 'common/models/directionsQuestionnaire/experts/expertReportDetails/reportDetail';

export function toCUISentExpertReports(ccdExportReportSent: CCDExportReportSent | undefined): SentExpertReports {
  const mapping = {
    'YES': YesNoNotReceived.YES,
    'NO': YesNoNotReceived.NO,
    'NOT_OBTAINED': YesNoNotReceived.NOT_RECEIVED,
  };
  if (ccdExportReportSent) {
    return new SentExpertReports(mapping[ccdExportReportSent]);
  }
}

export function toCUIExpertDetails(ccdExpertDetailsList: CCDExpertDetails[]): ExpertDetailsList {
  const convertedValue = ccdExpertDetailsList?.map(expertDetail => {
    const {
      value: {
        firstName,
        lastName,
        emailAddress,
        phoneNumber,
        whyRequired,
        fieldOfExpertise,
        estimatedCost,
      },
    } = expertDetail;
    return {
      firstName,
      lastName,
      emailAddress,
      phoneNumber: Number(phoneNumber) || undefined,
      whyNeedExpert: whyRequired,
      fieldOfExpertise,
      estimatedCost: estimatedCost/100 || undefined,
    } as ExpertDetails;
  });
  return new ExpertDetailsList(convertedValue);
}

export function toCUIExpertReportDetails(ccdLipExpert: CCDLiPExpert): ExpertReportDetails {
  return new ExpertReportDetails(
    toCUIYesNo(ccdLipExpert?.expertReportRequired),
    toCUIReportDetais(ccdLipExpert?.details),
  );
}

export function toCUIReportDetais(ccdReportDetails: CCDReportDetail[]): ReportDetail[] {
  if (ccdReportDetails) {
    return ccdReportDetails.map(reportDetail => {
      return {
        expertName: reportDetail.value?.expertName,
        reportDate: reportDetail.value?.reportDate,
      } as ReportDetail;
    });
  }
}
