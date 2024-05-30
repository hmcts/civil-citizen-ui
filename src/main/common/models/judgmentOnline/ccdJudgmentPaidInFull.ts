import {ClaimUpdate} from 'models/events/eventDto';

export interface CCDJudgmentPaidInFull extends ClaimUpdate {
    joJudgmentPaidInFull?: JoJudgmentPaidInFull;
}

export interface JoJudgmentPaidInFull {
  dateOfFullPaymentMade: Date,
  confirmFullPaymentMade: string[],
}
