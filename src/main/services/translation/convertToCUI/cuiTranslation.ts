import {Claim} from 'models/claim';
import {CCDClaim} from 'models/civilClaimResponse';
import {toCUIClaimDetails} from 'services/translation/convertToCUI/convertToCUIClaimDetails';
import {toCUIEvidence} from 'services/translation/convertToCUI/convertToCUIEvidence';
import {toCUIParty, toCUIPartyRespondent} from 'services/translation/convertToCUI/convertToCUIParty';
import {toCUIMediation} from 'services/translation/convertToCUI/convertToCUIMediation';
import {toCUIStatementOfMeans} from 'services/translation/convertToCUI/convertToCUIStatementOfMeans';

export const translateCCDCaseDataToCUIModel = (ccdClaim: CCDClaim): Claim => {
  const claim: Claim = Object.assign(new Claim(), ccdClaim);
  claim.claimDetails = toCUIClaimDetails(ccdClaim);
  claim.evidence = toCUIEvidence(ccdClaim?.speclistYourEvidenceList);
  claim.applicant1 = toCUIParty(ccdClaim?.applicant1);
  claim.respondent1 = toCUIPartyRespondent(ccdClaim?.respondent1,ccdClaim?.respondent1LiPResponse);
  claim.mediation = toCUIMediation(ccdClaim?.respondent1LiPResponse?.respondent1MediationLiPResponse);
  claim.statementOfMeans = toCUIStatementOfMeans(ccdClaim);
  return claim;
};

