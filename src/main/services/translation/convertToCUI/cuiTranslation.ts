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
import {toCUIGenericYesNo, toCUIYesNo} from 'services/translation/convertToCUI/convertToCUIYesNo';

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
    return directionQuestionnaire;
  }
}

