import {Claim} from 'models/claim';
// import {CCDClaim} from 'models/civilClaimResponse';
import {toCUIClaimDetails} from 'services/translation/convertToCUI/convertToCUIClaimDetails';
import {toCUIEvidence} from 'services/translation/convertToCUI/convertToCUIEvidence';
import {toCUIParty, toCUIPartyRespondent} from 'services/translation/convertToCUI/convertToCUIParty';
import {toCUIMediation} from 'services/translation/convertToCUI/convertToCUIMediation';
import {toCUIStatementOfMeans} from 'services/translation/convertToCUI/convertToCUIStatementOfMeans';
import {toCUIClaimBilingualLangPreference} from 'services/translation/convertToCUI/convertToCUIRespondentLiPResponse';
import {toCUIDirectionQuestionnaire} from './convertToCUIDQ/convertToCUIDirectionQuestionnaire';
// import {DirectionQuestionnaire} from 'common/models/directionsQuestionnaire/directionQuestionnaire';
// import {Hearing} from 'common/models/directionsQuestionnaire/hearing/hearing';
// import {ConsiderClaimantDocuments} from 'common/models/directionsQuestionnaire/hearing/considerClaimantDocuments';
// import {toCUIBoolean, toCUIGenericYesNo, toCUIYesNo} from 'services/translation/convertToCUI/convertToCUIYesNo';
// import {Experts} from 'common/models/directionsQuestionnaire/experts/experts';
// import {SentExpertReports} from 'common/models/directionsQuestionnaire/experts/sentExpertReports';
// import {
//   CCDExpertDetails,
//   CCDExportReportSent,
// } from 'common/models/ccdResponse/ccdExpert';
// import {ExpertDetailsList} from 'common/models/directionsQuestionnaire/experts/expertDetailsList';
// import {YesNoNotReceived} from 'common/form/models/yesNo';
// import {ExpertDetails} from 'common/models/directionsQuestionnaire/experts/expertDetails';
// import {SMALL_CLAIM_AMOUNT} from 'common/form/models/claimType';
// import {ExpertReportDetails} from 'common/models/directionsQuestionnaire/experts/expertReportDetails/expertReportDetails';
// import {CCDLiPExpert, CCDReportDetail} from 'common/models/ccdResponse/ccdLiPExpert';
// import {ReportDetail} from 'common/models/directionsQuestionnaire/experts/expertReportDetails/reportDetail';
// import {DeterminationWithoutHearing} from 'common/models/directionsQuestionnaire/hearing/determinationWithoutHearing';
// import {ExpertCanStillExamine} from 'common/models/directionsQuestionnaire/experts/expertCanStillExamine';

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

