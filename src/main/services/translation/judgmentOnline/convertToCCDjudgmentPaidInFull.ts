import {Claim} from 'models/claim';
import {CCDJudgmentPaidInFull, JoJudgmentPaidInFull} from 'models/judgmentOnline/ccdJudgmentPaidInFull';

export const toCCDjudgmentPaidInFull = (claim: Claim) : CCDJudgmentPaidInFull => {
  return {
    joJudgmentPaidInFull: toCCDjudgmentPaidInFullDetails(claim),
  };
};

export const toCCDjudgmentPaidInFullDetails = (claim: Claim) : JoJudgmentPaidInFull => {
  return {
    dateOfFullPaymentMade: claim.joJudgmentPaidInFull ? claim.joJudgmentPaidInFull.dateOfFullPaymentMade : null,
    confirmFullPaymentMade: claim.joJudgmentPaidInFull?.confirmFullPaymentMade ? ['CONFIRMED'] : null,
  };
};
