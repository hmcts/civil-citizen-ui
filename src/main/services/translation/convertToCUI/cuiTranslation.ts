import {Claim} from 'models/claim';
import {CCDClaim} from 'models/civilClaimResponse';
import {toCUIClaimDetails} from 'services/translation/convertToCUI/convertToCUIClaimDetails';
import {toCUIEvidence} from 'services/translation/convertToCUI/convertToCUIEvidence';
import {toCUIParty, toCUIPartyRespondent} from 'services/translation/convertToCUI/convertToCUIParty';
import {toCUIMediation} from 'services/translation/convertToCUI/convertToCUIMediation';
import {toCUIStatementOfMeans} from 'services/translation/convertToCUI/convertToCUIStatementOfMeans';
import {toCUIClaimBilingualLangPreference} from 'services/translation/convertToCUI/convertToCUIRespondentLiPResponse';
import {toCUIRejectAllOfClaim} from 'services/translation/convertToCUI/convertToCUIRejectAllOfClaim';
import {toCUIDQs} from 'services/translation/convertToCUI/convertToCUIDQs';
import {toCUIFullAdmission} from 'services/translation/convertToCUI/convertToCUIFullAdmission';
import {toCUIPartialAdmission} from './convertToCUIPartialAdmission';
import {toCUICaseProgressionHearing} from 'services/translation/convertToCUI/convertToCaseProgressionHearing';

export const translateCCDCaseDataToCUIModel = (ccdClaim: CCDClaim): Claim => {
  const claim: Claim = Object.assign(new Claim(), ccdClaim);
  claim.claimDetails = toCUIClaimDetails(ccdClaim);
  claim.evidence = toCUIEvidence(ccdClaim?.specResponselistYourEvidenceList, ccdClaim?.respondent1LiPResponse?.evidenceComment);
  claim.applicant1 = toCUIParty(ccdClaim?.applicant1);
  claim.respondent1 = toCUIPartyRespondent(ccdClaim?.respondent1,ccdClaim?.respondent1LiPResponse);
  claim.respondent1.responseType = ccdClaim?.respondent1ClaimResponseTypeForSpec;
  claim.mediation = toCUIMediation(ccdClaim?.respondent1LiPResponse?.respondent1MediationLiPResponse);
  claim.statementOfMeans = toCUIStatementOfMeans(ccdClaim);
  claim.claimBilingualLanguagePreference = toCUIClaimBilingualLangPreference(ccdClaim?.respondent1LiPResponse?.respondent1ResponseLanguage);
  claim.rejectAllOfClaim = toCUIRejectAllOfClaim(ccdClaim);
  claim.directionQuestionnaire = toCUIDQs(ccdClaim);
  claim.sdoOrderDocument = ccdClaim?.sdoOrderDocument;
  if (claim.isFullAdmission())
    claim.fullAdmission = toCUIFullAdmission(ccdClaim);
  else if (claim.isPartialAdmission())
    claim.partialAdmission = toCUIPartialAdmission(ccdClaim);
  }
  claim.caseProgressionHearing = toCUICaseProgressionHearing(ccdClaim);
  return claim;
};

