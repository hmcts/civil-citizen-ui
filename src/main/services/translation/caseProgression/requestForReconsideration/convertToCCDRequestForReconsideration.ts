import {Claim} from 'models/claim';
import {CaseRole} from 'form/models/caseRoles';
import {
  CCDRequestForReconsiderationClaimant,
  CCDRequestForReconsiderationDefendant,
} from 'models/ccdResponse/ccdRequestForReconsideration';

export const translateDraftRequestForReconsiderationToCCD = (claim: Claim): CCDRequestForReconsiderationDefendant | CCDRequestForReconsiderationClaimant => {

  if(claim.caseRole == CaseRole.CLAIMANT) {
    return {
      requestForReviewCommentsClaimant: claim.caseProgression?.requestForReviewClaimant?.textArea,
    };
  } else {
    return {
      requestForReviewCommentsDefendant: claim.caseProgression?.requestForReviewDefendant?.textArea,
    };
  }

};
