import {CCDJudgmentPaidInFull, JoJudgmentPaidInFull} from 'models/judgmentOnline/ccdJudgmentPaidInFull';
import {JudgmentOnline} from 'models/judgmentOnline/judgmentOnline';

export const toCCDjudgmentPaidInFull = (judgmentOnline: JudgmentOnline) : CCDJudgmentPaidInFull => {
  return {
    joJudgmentPaidInFull: toCCDjudgmentPaidInFullDetails(judgmentOnline),
  };
};

export const toCCDjudgmentPaidInFullDetails = (judgmentOnline: JudgmentOnline) : JoJudgmentPaidInFull => {
  return {
    dateOfFullPaymentMade: judgmentOnline.joJudgmentPaidInFull ? judgmentOnline.joJudgmentPaidInFull.dateOfFullPaymentMade : null,
    confirmFullPaymentMade: judgmentOnline.joJudgmentPaidInFull?.confirmFullPaymentMade ? ['CONFIRMED'] : null,
  };
};
