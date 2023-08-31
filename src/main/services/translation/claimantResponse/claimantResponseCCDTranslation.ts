import {Claim} from 'common/models/claim';
import {toCCDWitnesses} from '../response/convertToCCDWitnesses';
import {toCCDWelshLanguageRequirements} from '../response/convertToCCDWelshLanguageRequirements';
import {toCCDVulnerability} from '../response/convertToCCDVulenrabilityQuestions';
import {toCCDSpecificCourtLocations} from '../response/convertToCCDSpecificCourtLocations';
import {toCCDSmallClaimHearing} from '../response/convertToCCDSmallClaimHearing';
import {toCCDClaimantLiPResponse} from './convertToCCDClaimantLiPResponse';
import {toCCDYesNo} from '../response/convertToCCDYesNo';
import {toCCDExpert} from '../response/convertToCCDExpert';
import {CCDClaimantResponse} from 'common/models/claimantResponse/ccdClaimantResponse';
import {toCCDClaimantMediation} from './convertToCCDClaimantMediation';

export const translateClaimantResponseToCCD = (claim: Claim): CCDClaimantResponse => {
  return {
    applicant1AcceptAdmitAmountPaidSpec: toCCDYesNo(claim.claimantResponse?.hasPartAdmittedBeenAccepted?.option),
    applicant1ClaimMediationSpecRequiredLip: toCCDClaimantMediation(claim.claimantResponse?.mediation),
    // TODO : create this field on civil-service and ccd-def like respondent1LiPResponse
    applicant1LiPResponse: toCCDClaimantLiPResponse(claim.claimantResponse),
    applicant1DQLanguage: toCCDWelshLanguageRequirements(claim.claimantResponse?.directionQuestionnaire?.welshLanguageRequirements),
    applicant1DQVulnerabilityQuestions: toCCDVulnerability(claim.claimantResponse?.directionQuestionnaire?.vulnerabilityQuestions),
    applicant1DQRequestedCourt: toCCDSpecificCourtLocations(claim.claimantResponse?.directionQuestionnaire?.hearing?.specificCourtLocation),
    applicant1DQWitnesses: toCCDWitnesses(claim.claimantResponse?.directionQuestionnaire?.witnesses),
    applicant1DQSmallClaimHearing: claim.isSmallClaimsTrackDQ ? toCCDSmallClaimHearing(claim.claimantResponse?.directionQuestionnaire?.hearing) : undefined,
    applicant1DQExperts: toCCDExpert(claim),
    applicant1ClaimExpertSpecRequired: toCCDYesNo(claim.claimantResponse?.directionQuestionnaire?.experts?.permissionForExpert?.option),
  };
};
