import {Claim} from 'models/claim';
import {toCCDjudgmentPaidInFull} from 'services/translation/judgmentOnline/convertToCCDjudgmentPaidInFull';
import {CCDClaimJO} from 'models/judgmentOnline/ccdDto';

export const translateJudgmentOnlineToCCD = (claim: Claim): CCDClaimJO => {
  return {
    judgmentPaidInFull: toCCDjudgmentPaidInFull(claim),
  };
};
