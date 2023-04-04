
import {CCDClaim} from 'models/civilClaimResponse';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {toCUIWelshLanguageRequirements} from 'services/translation/convertToCUI/convertToCUIWelshLanguageRequirements';
import {toCUIVulnerability} from 'services/translation/convertToCUI/convertToCUIVulnerability';
import {toCUIHearing} from 'services/translation/convertToCUI/convertToCUIHearing';

export const toCUIDQs = (ccdClaim: CCDClaim): DirectionQuestionnaire => {
  if (ccdClaim){
    const dq : DirectionQuestionnaire = new DirectionQuestionnaire();
    dq.welshLanguageRequirements = toCUIWelshLanguageRequirements(ccdClaim.respondent1DQLanguage);
    dq.vulnerabilityQuestions = toCUIVulnerability(ccdClaim.respondent1DQVulnerabilityQuestions);
    dq.hearing = toCUIHearing(ccdClaim);
    return dq;
  }
};

