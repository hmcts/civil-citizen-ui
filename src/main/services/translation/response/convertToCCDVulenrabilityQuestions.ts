import {VulnerabilityQuestions} from 'models/directionsQuestionnaire/vulnerabilityQuestions/vulnerabilityQuestions';
import {toCCDYesNo} from 'services/translation/response/convertToCCDYesNo';

export const toCCDVulnerability = (vulnerabilityQuestions: VulnerabilityQuestions | undefined)  => {
  return {
    vulnerabilityAdjustmentsRequired: toCCDYesNo(vulnerabilityQuestions?.vulnerability?.option),
    vulnerabilityAdjustments: vulnerabilityQuestions?.vulnerability?.vulnerabilityDetails,
  };
};
