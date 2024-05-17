import {JudgmentPaidInFull} from 'models/judgmentOnline/judgmentPaidInFull';
import {ClaimUpdate} from 'models/events/eventDto';

export interface CCDClaimJO extends ClaimUpdate {
  judgmentPaidInFull?: JudgmentPaidInFull;
}
