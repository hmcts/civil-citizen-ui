import {toCCDYesNo} from 'services/translation/response/convertToCCDYesNo';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';

export const convertToCCDDocumentsToBeConsidered = (hearing: Hearing) => {
  if (hearing?.hasDocumentsToBeConsidered?.option) {
    return {
      hasDocumentsToBeConsidered: toCCDYesNo(hearing?.hasDocumentsToBeConsidered?.option),
      details: hearing?.documentsConsideredDetails,
    };
  }
};

