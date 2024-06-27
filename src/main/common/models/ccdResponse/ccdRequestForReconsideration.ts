import {ClaimUpdate} from 'models/events/eventDto';

export interface CCDRequestForReconsiderationDefendant extends ClaimUpdate {
  requestForReviewCommentsDefendant: string;
}

export interface CCDRequestForReconsiderationClaimant extends ClaimUpdate {
  requestForReviewCommentsClaimant: string;
}
