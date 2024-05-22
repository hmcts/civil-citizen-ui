import {Claim} from 'models/claim';
import {CCDJudgmentPaidInFull} from 'models/judgmentOnline/ccdJudgmentPaidInFull';

export const toCCDjudgmentPaidInFull = (claim: Claim): CCDJudgmentPaidInFull => {

  return {
    dateOfFullPaymentMade: claim.judgmentPaidInFull ? claim.judgmentPaidInFull.dateOfFullPaymentMade : null,
    confirmFullPaymentMade: claim.judgmentPaidInFull?.confirmFullPaymentMade ? ['CONFIRMED'] : null,
  };
};
