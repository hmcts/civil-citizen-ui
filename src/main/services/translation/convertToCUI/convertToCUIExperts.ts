import {CCDClaim} from 'common/models/civilClaimResponse';
import {Experts} from 'common/models/directionsQuestionnaire/experts/experts';
import {toCUIBoolean, toCUIGenericYesNo, toCUIYesNo} from './convertToCUIYesNo';
import {analyseClaimType, claimType} from 'common/form/models/claimType';
import {ExpertCanStillExamine} from 'common/models/directionsQuestionnaire/experts/expertCanStillExamine';
import {YesNoNotReceived} from 'common/form/models/yesNo';
import {SentExpertReports} from 'common/models/directionsQuestionnaire/experts/sentExpertReports';
import {ReportDetail} from 'common/models/directionsQuestionnaire/experts/expertReportDetails/reportDetail';
import {ExpertDetails} from 'common/models/directionsQuestionnaire/experts/expertDetails';
import {ExpertDetailsList} from 'common/models/directionsQuestionnaire/experts/expertDetailsList';
import {
  ExpertReportDetails,
} from 'common/models/directionsQuestionnaire/experts/expertReportDetails/expertReportDetails';
import {
  CCDLiPExpert,
  CCDReportDetail,
} from 'common/models/ccdResponse/ccdLiPExpert';
import {
  CCDExpertDetails,
  CCDExportReportSent,
} from 'common/models/ccdResponse/ccdExpert';
import {CaseRole} from 'form/models/caseRoles';
import { convertToPound } from '../claim/moneyConversation';

export const toCUIExperts = (ccdClaim: CCDClaim): Experts => {
  if (ccdClaim) {
    const experts: Experts = new Experts();
    if (ccdClaim.responseClaimTrack === claimType.SMALL_CLAIM || analyseClaimType(ccdClaim.totalClaimAmount) === claimType.SMALL_CLAIM) {
      if (ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.respondent1DQLiPExpert?.caseNeedsAnExpert) {
        experts.expertRequired = toCUIBoolean(ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.respondent1DQLiPExpert?.caseNeedsAnExpert);
      }
      if (ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.respondent1DQLiPExpert) {
        experts.expertReportDetails = toCUIExpertReportDetails(ccdClaim, ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.respondent1DQLiPExpert);
      }
      if (ccdClaim.responseClaimExpertSpecRequired) {
        experts.permissionForExpert = toCUIGenericYesNo(ccdClaim.responseClaimExpertSpecRequired);
      }
      if (ccdClaim.respondent1DQExperts?.expertRequired || ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.respondent1DQLiPExpert?.expertCanStillExamineDetails) {
        experts.expertCanStillExamine = {
          option: toCUIYesNo(ccdClaim.respondent1DQExperts?.expertRequired),
          details: ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.respondent1DQLiPExpert?.expertCanStillExamineDetails,
        } as ExpertCanStillExamine;
      }
    } else {
      if (ccdClaim.respondent1DQExperts?.expertRequired) {
        experts.expertEvidence = toCUIGenericYesNo(ccdClaim.respondent1DQExperts?.expertRequired);
      }
      if (ccdClaim.respondent1DQExperts?.expertReportsSent) {
        experts.sentExpertReports = toCUISentExpertReports(ccdClaim.respondent1DQExperts?.expertReportsSent);
      }
      if (ccdClaim.respondent1DQExperts?.jointExpertSuitable) {
        experts.sharedExpert = toCUIGenericYesNo(ccdClaim.respondent1DQExperts?.jointExpertSuitable);
      }
    }
    if (ccdClaim.respondent1DQExperts?.details) {
      experts.expertDetailsList = toCUIExpertDetails(ccdClaim.respondent1DQExperts?.details);
    }

    return experts;
  }
};

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
      estimatedCost: convertToPound(estimatedCost) || undefined,
    } as ExpertDetails;
  });
  return new ExpertDetailsList(convertedValue);
}

export function toCUIExpertReportDetails(ccdClaim: CCDClaim, ccdLipExpert: CCDLiPExpert): ExpertReportDetails {
  return new ExpertReportDetails(
    ccdClaim.caseRole === CaseRole.APPLICANTSOLICITORONE || ccdClaim.caseRole === CaseRole.CLAIMANT || ccdClaim.caseRole === CaseRole.CREATOR,
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
