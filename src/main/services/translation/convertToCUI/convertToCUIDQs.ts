
import {CCDClaim} from 'models/civilClaimResponse';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {toCUIWelshLanguageRequirements} from 'services/translation/convertToCUI/convertToCUIWelshLanguageRequirements';
import {toCUIVulnerability} from 'services/translation/convertToCUI/convertToCUIVulnerability';
import {toCUIHearing} from 'services/translation/convertToCUI/convertToCUIHearing';
import {toCUIWitnesses} from 'services/translation/convertToCUI/convertToCUIWitnesses';
import {toCUIGenericYesNo} from 'services/translation/convertToCUI/convertToCUIYesNo';
import {toCUIExperts} from './convertToCUIExperts';
import {analyseClaimType} from 'common/form/models/claimType';

export const toCUIDQs = (ccdClaim: CCDClaim, isMintiEnabled = false): DirectionQuestionnaire => {
  if (ccdClaim) {
    ccdClaim.claimType = analyseClaimType(ccdClaim.totalClaimAmount, isMintiEnabled);
    const dq : DirectionQuestionnaire = new DirectionQuestionnaire();
    dq.welshLanguageRequirements = toCUIWelshLanguageRequirements(ccdClaim.respondent1DQLanguage);
    dq.vulnerabilityQuestions = toCUIVulnerability(ccdClaim.respondent1DQVulnerabilityQuestions);
    dq.hearing = toCUIHearing(ccdClaim);
    dq.witnesses = toCUIWitnesses(ccdClaim.respondent1DQWitnesses);
    dq.defendantYourselfEvidence = toCUIGenericYesNo(ccdClaim.respondent1LiPResponse?.respondent1DQExtraDetails?.giveEvidenceYourSelf);
    dq.experts = toCUIExperts(ccdClaim);
    return dq;
  }
};

