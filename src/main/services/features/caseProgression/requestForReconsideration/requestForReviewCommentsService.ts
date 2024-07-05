import {Claim} from 'models/claim';
import {
  RequestForReviewCommentsForm,
} from 'models/caseProgression/requestForReconsideration/requestForReviewCommentsForm';
import {CaseRole} from 'form/models/caseRoles';

export const getRequestForReviewCommentsForm = (claim: Claim): RequestForReviewCommentsForm => {
  let requestForReviewComments: RequestForReviewCommentsForm;
  if(claim.caseRole == CaseRole.CLAIMANT) {
    requestForReviewComments = claim.caseProgression?.requestForReviewClaimant;
  } else {
    requestForReviewComments = claim.caseProgression?.requestForReviewDefendant;
  }
  return requestForReviewComments;
};
