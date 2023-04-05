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
import {CCDExpertDetails, CCDExportReportSent} from 'common/models/ccdResponse/ccdExpert';
// import {ExpertReportDetails} from 'common/models/directionsQuestionnaire/experts/expertReportDetails/expertReportDetails';
// import {ExpertDetails} from 'common/models/directionsQuestionnaire/experts/expertDetails';
import {ExpertDetailsList} from 'common/models/directionsQuestionnaire/experts/expertDetailsList';

export const translateCCDCaseDataToCUIModel = (ccdClaim: CCDClaim): Claim => {
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

    directionQuestionnaire.hearing.triedToSettle = toCUIGenericYesNo(ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.triedToSettle);
    directionQuestionnaire.hearing.requestExtra4weeks = toCUIGenericYesNo(ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.requestExtra4weeks);
    directionQuestionnaire.hearing.considerClaimantDocuments =
    {
      option: toCUIYesNo(ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.considerClaimantDocuments),
      details: ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.considerClaimantDocumentsDetails,
    } as ConsiderClaimantDocuments;
    // 5.4 Experts (For Fast track)
    // TODO try to find a way to understand fast track
    // /directions-questionnaire/expert-evidence (Do you want to use expert evidence )
    directionQuestionnaire.experts = new Experts();
    directionQuestionnaire.experts.expertEvidence = toCUIGenericYesNo(ccdClaim.respondent1DQExperts?.expertRequired); // Fast-track
    directionQuestionnaire.experts.expertRequired = toCUIBoolean(ccdClaim.respondent1DQExperts?.expertRequired); // small-claim
    // /directions-questionnaire/sent-expert-reports (Have you already sent expert reports to other parties)
    directionQuestionnaire.experts.sentExpertReports = toCUISentExpertReports(ccdClaim.respondent1DQExperts?.expertReportsSent);
    // /directions-questionnaire/shared-expert (Do you want to share an expert with the claimant? )
    directionQuestionnaire.experts.sharedExpert = toCUIGenericYesNo(ccdClaim.respondent1DQExperts?.jointExpertSuitable);
    // /directions-questionnaire/expert-details (Enter the expert's details)
    directionQuestionnaire.experts.expertDetailsList = toCUIExpertDetails(ccdClaim.respondent1DQExperts?.details);
    // 5.5 Experts (For Small claims)
    // directions-questionnaire/expert-reports
    // done in fast track
    // directions-questionnaire/permission-for-expert
    directionQuestionnaire.experts.permissionForExpert = toCUIGenericYesNo(ccdClaim.responseClaimExpertSpecRequired);
    // /directions-questionnaire/expert-evidence
    // done in fast track
    // /directions-questionnaire/expert-details (Enter the expert's details)
    // done in fast track

    // -/-/-/-/-/-/-/-/-/-/
    // *5.4 Experts (For Fast track)
    // */directions-questionnaire/expert-evidence (Do you want to use expert evidence )
    // */directions-questionnaire/sent-expert-reports (Have you already sent expert reports to other parties)
    // */directions-questionnaire/shared-expert (Do you want to share an expert with the claimant? )
    // */directions-questionnaire/expert-details (Enter the expert's details)

    // 5.5 Experts (For Small claims)
    // +directions-questionnaire/sent-expert-reports
    // +directions-questionnaire/permission-for-expert
    // +/directions-questionnaire/expert-evidence
    // +/directions-questionnaire/expert-details (Enter the expert's details)
    return directionQuestionnaire;
  }
}

export function toCUISentExpertReports(ccdExportReportSent: CCDExportReportSent): SentExpertReports {
  console.log(ccdExportReportSent);
  return new SentExpertReports();

}

export function toCUIExpertDetails(ccdExpertDetailsList: CCDExpertDetails[]): ExpertDetailsList {
  console.log(ccdExpertDetailsList);
  return new ExpertDetailsList();

}

