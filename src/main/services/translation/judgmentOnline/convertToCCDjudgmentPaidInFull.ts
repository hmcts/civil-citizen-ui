import {Claim} from 'models/claim';
import {CCDJudgmentPaidInFull, JoJudgmentPaidInFull} from 'models/judgmentOnline/ccdJudgmentPaidInFull';
import {JoClaim} from 'models/judgmentOnline/joClaim';

export const toCCDjudgmentPaidInFull = (claim: Claim) : CCDJudgmentPaidInFull => {
  return {
    joJudgmentPaidInFull: toCCDjudgmentPaidInFullDetails(claim),
  };
};

export const toCCDjudgmentPaidInFullDetails = (joClaim: JoClaim) : JoJudgmentPaidInFull => {
  return {
    dateOfFullPaymentMade: joClaim.joJudgmentPaidInFull ? joClaim.joJudgmentPaidInFull.dateOfFullPaymentMade : null,
    confirmFullPaymentMade: joClaim.joJudgmentPaidInFull?.confirmFullPaymentMade ? ['CONFIRMED'] : null,
  };
};
