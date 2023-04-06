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
    if (ccdClaim.totalClaimAmount <= SMALL_CLAIM_AMOUNT) {
      directionQuestionnaire.hearing.determinationWithoutHearing = {
        option: toCUIYesNo(ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.determinationWithoutHearingRequired),
        reasonForHearing: ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.determinationWithoutHearingReason,
      } as DeterminationWithoutHearing;
      directionQuestionnaire.experts.expertRequired = toCUIBoolean(ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.respondent1DQLiPExpert?.caseNeedsAnExpert);
      directionQuestionnaire.experts.expertReportDetails = toCUIExpertReportDetails(ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.respondent1DQLiPExpert);
      directionQuestionnaire.experts.permissionForExpert = toCUIGenericYesNo(ccdClaim.responseClaimExpertSpecRequired);
      directionQuestionnaire.experts.expertCanStillExamine = {
        option: toCUIYesNo(ccdClaim.respondent1DQExperts?.expertRequired),
        details: ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.respondent1DQLiPExpert?.expertCanStillExamineDetails,
      } as ExpertCanStillExamine;
    } else {
      directionQuestionnaire.hearing.triedToSettle = toCUIGenericYesNo(ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.triedToSettle);
      directionQuestionnaire.hearing.requestExtra4weeks = toCUIGenericYesNo(ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.requestExtra4weeks);
      directionQuestionnaire.hearing.considerClaimantDocuments =
        {
          option: toCUIYesNo(ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.considerClaimantDocuments),
          details: ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.considerClaimantDocumentsDetails,
        } as ConsiderClaimantDocuments;
      directionQuestionnaire.experts.expertEvidence = toCUIGenericYesNo(ccdClaim.respondent1DQExperts?.expertRequired);
      directionQuestionnaire.experts.sentExpertReports = toCUISentExpertReports(ccdClaim.respondent1DQExperts?.expertReportsSent);
      directionQuestionnaire.experts.sharedExpert = toCUIGenericYesNo(ccdClaim.respondent1DQExperts?.jointExpertSuitable);
    }
    directionQuestionnaire.experts.expertDetailsList = toCUIExpertDetails(ccdClaim.respondent1DQExperts?.details);
    return directionQuestionnaire;
  }
}