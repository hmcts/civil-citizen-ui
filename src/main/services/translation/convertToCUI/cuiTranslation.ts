import {Claim} from 'models/claim';
import {CCDClaim} from 'models/civilClaimResponse';
import {toCUIClaimDetails} from 'services/translation/convertToCUI/convertToCUIClaimDetails';
import {toCUIEvidence} from 'services/translation/convertToCUI/convertToCUIEvidence';
import {toCUIParty} from 'services/translation/convertToCUI/convertToCUIParty';
import {toCUIMediation} from 'services/translation/convertToCUI/convertToCUIMediation';
import {YesNo} from 'form/models/yesNo';
import {toCUIAddress} from 'services/translation/convertToCUI/convertToCUIAddress';

export const translateCCDCaseDataToCUIModel = (ccdClaim: CCDClaim): Claim => {
  const claim: Claim = Object.assign(new Claim(), ccdClaim);
  claim.claimDetails = toCUIClaimDetails(ccdClaim);
  claim.evidence = toCUIEvidence(ccdClaim?.speclistYourEvidenceList);
  claim.applicant1 = toCUIParty(ccdClaim?.applicant1);
  claim.respondent1 = toCUIParty(ccdClaim?.respondent1);
  claim.respondent1.partyDetails.correspondenceAddress = toCUIAddress(ccdClaim.respondent1LiPResponse?.respondent1LiPCorrespondenceAddress);
  claim.respondent1.partyDetails.provideCorrespondenceAddress = claim.respondent1.partyDetails.correspondenceAddress ? YesNo.YES : YesNo.NO;
  claim.respondent1.partyDetails.postToThisAddress = claim.respondent1.partyDetails.correspondenceAddress ? YesNo.YES : YesNo.NO;
  claim.mediation = toCUIMediation(ccdClaim?.respondent1LiPResponse?.respondent1MediationLiPResponse);
  return claim;
};
