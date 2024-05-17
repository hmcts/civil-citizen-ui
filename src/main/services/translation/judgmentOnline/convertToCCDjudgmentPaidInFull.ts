import {JudgmentPaidInFull} from 'models/judgmentOnline/judgmentPaidInFull';
import {Claim} from 'models/claim';

export const toCCDjudgmentPaidInFull = (claim: Claim): JudgmentPaidInFull => {
  return {
    dateOfFullPaymentMade: claim.judgmentPaidInFull?.dateOfFullPaymentMade,
    confirmFullPaymentMade: claim.judgmentPaidInFull.confirmFullPaymentMade,
  };
};
