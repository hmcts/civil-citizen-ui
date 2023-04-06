import {Claim} from 'models/claim';
import {CCDClaim} from 'models/civilClaimResponse';
import {toCUIClaimDetails} from 'services/translation/convertToCUI/convertToCUIClaimDetails';
import {toCUIEvidence} from 'services/translation/convertToCUI/convertToCUIEvidence';
import {toCUIParty, toCUIPartyRespondent} from 'services/translation/convertToCUI/convertToCUIParty';
import {toCUIMediation} from 'services/translation/convertToCUI/convertToCUIMediation';
import {toCUIStatementOfMeans} from 'services/translation/convertToCUI/convertToCUIStatementOfMeans';
import {toCUIClaimBilingualLangPreference} from 'services/translation/convertToCUI/convertToCUIRespondentLiPResponse';
import {DirectionQuestionnaire} from 'common/models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'common/models/directionsQuestionnaire/hearing/hearing';
import {ConsiderClaimantDocuments} from 'common/models/directionsQuestionnaire/hearing/considerClaimantDocuments';
import {toCUIBoolean, toCUIGenericYesNo, toCUIYesNo} from 'services/translation/convertToCUI/convertToCUIYesNo';
import {Experts} from 'common/models/directionsQuestionnaire/experts/experts';
import {SentExpertReports} from 'common/models/directionsQuestionnaire/experts/sentExpertReports';
import {
  CCDExpertDetails,
  CCDExportReportSent,
} from 'common/models/ccdResponse/ccdExpert';
import {ExpertDetailsList} from 'common/models/directionsQuestionnaire/experts/expertDetailsList';
import {YesNoNotReceived} from 'common/form/models/yesNo';
import {ExpertDetails} from 'common/models/directionsQuestionnaire/experts/expertDetails';
import {SMALL_CLAIM_AMOUNT} from 'common/form/models/claimType';
import {ExpertReportDetails} from 'common/models/directionsQuestionnaire/experts/expertReportDetails/expertReportDetails';
import {CCDLiPExpert, CCDReportDetail} from 'common/models/ccdResponse/ccdLiPExpert';
import {ReportDetail} from 'common/models/directionsQuestionnaire/experts/expertReportDetails/reportDetail';
import {DeterminationWithoutHearing} from 'common/models/directionsQuestionnaire/hearing/determinationWithoutHearing';
import {ExpertCanStillExamine} from 'common/models/directionsQuestionnaire/experts/expertCanStillExamine';

export const translateCCDCaseDataToCUIModel = (ccdClaim: any): Claim => {
  const claim: Claim = Object.assign(new Claim(), ccdClaim);
  claim.claimDetails = toCUIClaimDetails(ccdClaim);
  claim.evidence = toCUIEvidence(ccdClaim?.speclistYourEvidenceList);
  claim.applicant1 = toCUIParty(ccdClaim?.applicant1);
  claim.respondent1 = toCUIPartyRespondent(ccdClaim?.respondent1,ccdClaim?.respondent1LiPResponse);
  claim.mediation = toCUIMediation(ccdClaim?.respondent1LiPResponse?.respondent1MediationLiPResponse);
  claim.statementOfMeans = toCUIStatementOfMeans(ccdClaim);
  claim.claimBilingualLanguagePreference = toCUIClaimBilingualLangPreference(ccdClaim?.respondent1LiPResponse?.respondent1ResponseLanguage);
  claim.directionQuestionnaire = toCUIDirectionQuestionnaire(ccdClaim);
  return claim;
};

export function toCUIDirectionQuestionnaire(ccdClaim: CCDClaim): DirectionQuestionnaire {
  if (ccdClaim) {
    const directionQuestionnaire = new DirectionQuestionnaire();
    directionQuestionnaire.hearing = new Hearing();
    // /directions-questionnaire/tried-to-settle
    directionQuestionnaire.hearing.triedToSettle = toCUIGenericYesNo(ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.triedToSettle);
    // /directions-questionnaire/request-extra-4-weeks
    directionQuestionnaire.hearing.requestExtra4weeks = toCUIGenericYesNo(ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.requestExtra4weeks);
    // /directions-questionnaire/consider-claimant-documents
    directionQuestionnaire.hearing.considerClaimantDocuments =
    {
      option: toCUIYesNo(ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.considerClaimantDocuments),
      details: ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.considerClaimantDocumentsDetails,
    } as ConsiderClaimantDocuments;
    // 5.4 Experts (For Fast track)
    directionQuestionnaire.experts = new Experts();
    console.log('total----', ccdClaim.totalClaimAmount);
    if (ccdClaim.totalClaimAmount <= SMALL_CLAIM_AMOUNT) {
      // /directions-questionnaire/expert-evidence ---->  /directions-questionnaire/expert
      directionQuestionnaire.experts.expertRequired = toCUIBoolean(ccdClaim.respondent1DQExperts?.expertRequired); // small-claim
      console.log('total--small----expertRequired', directionQuestionnaire.experts.expertRequired);
    } else {
      // /directions-questionnaire/expert-evidence (Do you want to use expert evidence )
      directionQuestionnaire.experts.expertEvidence = toCUIGenericYesNo(ccdClaim.respondent1DQExperts?.expertRequired); // Fast-track
      console.log('total--fast----expertEvidence', directionQuestionnaire.experts.expertEvidence);
    }
    // /directions-questionnaire/sent-expert-reports (Have you already sent expert reports to other parties)
    directionQuestionnaire.experts.sentExpertReports = toCUISentExpertReports(ccdClaim.respondent1DQExperts?.expertReportsSent);
    // /directions-questionnaire/shared-expert (Do you want to share an expert with the claimant? )
    directionQuestionnaire.experts.sharedExpert = toCUIGenericYesNo(ccdClaim.respondent1DQExperts?.jointExpertSuitable);
    // /directions-questionnaire/expert-details (Enter the expert's details)
    directionQuestionnaire.experts.expertDetailsList = toCUIExpertDetails(ccdClaim.respondent1DQExperts?.details);
    // 5.5 Experts (For Small claims)
    // /directions-questionnaire/determination-without-hearing (Determination without Hearing Questions)
    directionQuestionnaire.hearing.determinationWithoutHearing = {
      option: toCUIYesNo(ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.determinationWithoutHearingRequired),
      reasonForHearing: ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.determinationWithoutHearingReason,
    } as DeterminationWithoutHearing;
    // directions-questionnaire/expert-reports (Have you already got a report written by an expert?)
    directionQuestionnaire.experts.expertReportDetails = toCCDExpertReportDetails(ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.respondent1DQLiPExpert);
    // directions-questionnaire/permission-for-expert
    directionQuestionnaire.experts.permissionForExpert = toCUIGenericYesNo(ccdClaim.responseClaimExpertSpecRequired);
    // directions-questionnaire/expert-can-still-examine (Does the claim involve something an expert can still examine?)
    directionQuestionnaire.experts.expertCanStillExamine = {
      option: toCUIYesNo(ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.respondent1DQLiPExpert?.expertCanStillExamine),
      details: ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.respondent1DQLiPExpert?.expertCanStillExamineDetails,
    } as ExpertCanStillExamine; // ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.respondent1DQLiPExpert);
    // /directions-questionnaire/expert-evidence ---->  /directions-questionnaire/expert
    // done in fast track
    // /directions-questionnaire/expert-details (Enter the expert's details)
    // done in fast track

    // -/-/-/-/-/-/-/-/-/-/
    // *5.4 Experts (For Fast track)
    // */directions-questionnaire/defendant-expert-evidence ----> expert-evidence (Do you want to use expert evidence )
    // */directions-questionnaire/expert-reports -----> sent-expert-reports (Have you already sent expert reports to other parties)
    // */directions-questionnaire/shared-expert (Do you want to share an expert with the claimant? )
    // */directions-questionnaire/expert-details (Enter the expert's details)

    // 5.5 Experts (For Small claims)
    // +directions-questionnaire/expert-reports ????
    // +directions-questionnaire/permission-for-expert
    // +/directions-questionnaire/expert-evidence-----> expert? ===> expert-evidence with fast track
    // +/directions-questionnaire/expert-details (Enter the expert's details)
    return directionQuestionnaire;
  }
}

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
      phoneNumber: Number(phoneNumber),
      whyNeedExpert: whyRequired,
      fieldOfExpertise,
      estimatedCost,
    } as ExpertDetails;
  });
  return new ExpertDetailsList(convertedValue);
}

export function toCCDExpertReportDetails(ccdLipExpert: CCDLiPExpert): ExpertReportDetails {
  return new ExpertReportDetails(
    toCUIYesNo(ccdLipExpert.expertReportRequired),
    toCUIReportDetais(ccdLipExpert.reportDetails),
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
