import {toCCDYesNo} from 'services/translation/response/convertToCCDYesNo';
import {Claim} from 'models/claim';

export const convertToCCDDocumentsToBeConsidered = (claim: Claim) => {
  if (claim && claim.directionQuestionnaire?.hearing?.hasDocumentsToBeConsidered?.option) {
    return {
      hasDocumentsToBeConsidered: toCCDYesNo(claim.directionQuestionnaire?.hearing?.hasDocumentsToBeConsidered?.option),
      details: claim.directionQuestionnaire?.hearing?.documentsConsideredDetails,
    };
  }
};

