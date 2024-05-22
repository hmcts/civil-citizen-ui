import {ClaimUpdate} from 'models/events/eventDto';

export interface CCDJudgmentPaidInFull extends ClaimUpdate {

    dateOfFullPaymentMade: Date,
    confirmFullPaymentMade: string[],
}
