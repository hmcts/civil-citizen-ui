
import {CCDClaim} from 'models/civilClaimResponse';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {toCUIWelshLanguageRequirements} from 'services/translation/convertToCUI/convertToCUIWelshLanguageRequirements';
import {toCUIVulnerability} from 'services/translation/convertToCUI/convertToCUIVulnerability';
import {toCUIHearing} from 'services/translation/convertToCUI/convertToCUIHearing';
import {toCUIWitnesses} from "services/translation/convertToCUI/convertToCUIWitnesses";
import {toCUIGenericYesNo} from "services/translation/convertToCUI/convertToCUIYesNo";

export const toCUIDQs = (ccdClaim: CCDClaim): DirectionQuestionnaire => {
  if (ccdClaim){
    const dq : DirectionQuestionnaire = new DirectionQuestionnaire();
    dq.welshLanguageRequirements = toCUIWelshLanguageRequirements(ccdClaim.respondent1DQLanguage);
    dq.vulnerabilityQuestions = toCUIVulnerability(ccdClaim.respondent1DQVulnerabilityQuestions);
    dq.hearing = toCUIHearing(ccdClaim);
    dq.witnesses = toCUIWitnesses(ccdClaim.respondent1DQWitnesses);
    dq.defendantYourselfEvidence = toCUIGenericYesNo(ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.giveEvidenceYourSelf);
    return dq;
  }
};

