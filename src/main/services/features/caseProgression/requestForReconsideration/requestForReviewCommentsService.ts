import {Claim} from 'models/claim';
import {
  RequestForReviewCommentsForm,
} from 'models/caseProgression/requestForReconsideration/requestForReviewCommentsForm';
import {CaseRole} from 'form/models/caseRoles';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {
  buildCaseInfoContents,
} from 'services/features/response/checkAnswers/caseProgression/requestForReconsideration/buildRequestForReconsiderationConfirmationSection';

export const getRequestForReviewCommentsForm = (claim: Claim): RequestForReviewCommentsForm => {
  let requestForReviewComments: RequestForReviewCommentsForm;
  if(claim.caseRole == CaseRole.CLAIMANT) {
    requestForReviewComments = claim.caseProgression?.requestForReviewClaimant;
  } else {
    requestForReviewComments = claim.caseProgression?.requestForReviewDefendant;
  }
  return requestForReviewComments;
};

export const getCommentsCYACaseInfoContents = (claimId: string, claim: Claim): ClaimSummarySection[] => {
  return buildCaseInfoContents(claim, claimId, 'PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW_COMMENTS.MICRO_TEXT');
};
