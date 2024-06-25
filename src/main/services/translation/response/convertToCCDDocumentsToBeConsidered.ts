import {toCCDYesNo} from 'services/translation/response/convertToCCDYesNo';
import {Claim} from 'models/claim';

export const convertToCCDDocumentsToBeConsidered = (claim: Claim) => {
  return {
    hasDocumentsToBeConsidered: toCCDYesNo(claim.directionQuestionnaire?.hearing?.hasClaimantDocumentsToBeConsidered?.option),
    details: claim.directionQuestionnaire?.hearing?.claimantDocumentsConsideredDetails,
  };
};

