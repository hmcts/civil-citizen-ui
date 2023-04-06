import {CCDClaim} from 'common/models/civilClaimResponse';
import {DirectionQuestionnaire} from 'common/models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'common/models/directionsQuestionnaire/hearing/hearing';
import {
  toCUIBoolean,
  toCUIGenericYesNo,
  toCUIYesNo,
} from '../convertToCUIYesNo';
import {ConsiderClaimantDocuments} from 'common/models/directionsQuestionnaire/hearing/considerClaimantDocuments';
import {Experts} from 'common/models/directionsQuestionnaire/experts/experts';
import {SMALL_CLAIM_AMOUNT} from 'common/form/models/claimType';
import {DeterminationWithoutHearing} from 'common/models/directionsQuestionnaire/hearing/determinationWithoutHearing';
import {ExpertCanStillExamine} from 'common/models/directionsQuestionnaire/experts/expertCanStillExamine';
import {toCUIExpertReportDetails, toCUIExpertDetails, toCUISentExpertReports} from './covertToCUIDQExperts';

export function toCUIDirectionQuestionnaire(ccdClaim: CCDClaim): DirectionQuestionnaire {
  if (ccdClaim) {
    const directionQuestionnaire = new DirectionQuestionnaire();
    directionQuestionnaire.hearing = new Hearing();
    directionQuestionnaire.experts = new Experts();
    console.log('total----', ccdClaim.totalClaimAmount);
    if (ccdClaim.totalClaimAmount <= SMALL_CLAIM_AMOUNT) {
      console.log('------------------------------------------ SMALL -------------------------------');
      // /directions-questionnaire/determination-without-hearing (Determination without Hearing Questions)
      directionQuestionnaire.hearing.determinationWithoutHearing = {
        option: toCUIYesNo(ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.determinationWithoutHearingRequired),
        reasonForHearing: ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.determinationWithoutHearingReason,
      } as DeterminationWithoutHearing;
      // /directions-questionnaire/expert (Using an expert)
      directionQuestionnaire.experts.expertRequired = toCUIBoolean(ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.respondent1DQLiPExpert?.caseNeedsAnExpert); // small-claim
      // directions-questionnaire/expert-reports (Have you already got a report written by an expert?)
      directionQuestionnaire.experts.expertReportDetails = toCUIExpertReportDetails(ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.respondent1DQLiPExpert);
      // directions-questionnaire/permission-for-expert
      directionQuestionnaire.experts.permissionForExpert = toCUIGenericYesNo(ccdClaim.responseClaimExpertSpecRequired);
      // directions-questionnaire/expert-can-still-examine (Does the claim involve something an expert can still examine?)
      directionQuestionnaire.experts.expertCanStillExamine = {
        option: toCUIYesNo(ccdClaim.respondent1DQExperts?.expertRequired),
        details: ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.respondent1DQLiPExpert?.expertCanStillExamineDetails,
      } as ExpertCanStillExamine; // ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.respondent1DQLiPExpert);
    } else {
      console.log('------------------------------------------ FAST -------------------------------');
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
      // /directions-questionnaire/expert-evidence (Do you want to use expert evidence )
      directionQuestionnaire.experts.expertEvidence = toCUIGenericYesNo(ccdClaim.respondent1DQExperts?.expertRequired); // Fast-track
      // /directions-questionnaire/sent-expert-reports (Have you already sent expert reports to other parties)
      directionQuestionnaire.experts.sentExpertReports = toCUISentExpertReports(ccdClaim.respondent1DQExperts?.expertReportsSent);
      // /directions-questionnaire/shared-expert (Do you want to share an expert with the claimant? )
      directionQuestionnaire.experts.sharedExpert = toCUIGenericYesNo(ccdClaim.respondent1DQExperts?.jointExpertSuitable);
    }
    // /directions-questionnaire/expert-details (Enter the expert's details)
    directionQuestionnaire.experts.expertDetailsList = toCUIExpertDetails(ccdClaim.respondent1DQExperts?.details);
    return directionQuestionnaire;
  }
}