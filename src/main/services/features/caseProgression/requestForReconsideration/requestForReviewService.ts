import {Claim} from 'models/claim';
import {CaseRole} from 'form/models/caseRoles';
import {RequestForReviewForm} from 'models/caseProgression/requestForReconsideration/requestForReviewForm';
import {SummarySections} from 'models/summaryList/summarySections';
import {
  buildRequestForReconsideration, buildRequestForReconsiderationComments,
} from 'services/features/response/checkAnswers/caseProgression/requestForReconsideration/buildRequestForReconsiderationConfirmationSection';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {
  buildCaseInfoContents,
} from 'services/features/response/checkAnswers/caseProgression/requestForReconsideration/buildRequestForReconsiderationConfirmationSection';

export const getRequestForReviewForm = (claim: Claim): RequestForReviewForm => {
  let requestForReview: RequestForReviewForm;
  if(claim.caseRole == CaseRole.CLAIMANT) {
    requestForReview = claim.caseProgression?.requestForReviewClaimant;
  } else {
    requestForReview = claim.caseProgression?.requestForReviewDefendant;
  }
  return requestForReview;
};

export const getSummarySections = (claimId: string, claim: Claim, lang?: string ): SummarySections => {
  return buildSummarySections(claim, claimId, lang);
};

export const getSummarySectionsComments = (claimId: string, claim: Claim, lang?: string ): SummarySections => {
  return {
    sections: [
      buildRequestForReconsiderationComments(claim, claimId, lang),
    ],
  };
};

const buildSummarySections = (claim: Claim, claimId: string, lang: string ): SummarySections => {
  return {
    sections: [
      buildRequestForReconsideration(claim, claimId, lang),
    ],
  };
};

export const getCaseInfoContents = (claimId: string, claim: Claim): ClaimSummarySection[] => {
  return buildCaseInfoContents(claim, claimId, 'PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW.MICRO_TEXT');
};
