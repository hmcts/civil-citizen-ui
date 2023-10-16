import {ClaimUpdate} from 'models/events/eventDto';
import {YesNoUpperCamelCase} from 'common/form/models/yesNo';
import {CCDWelshLanguageRequirements} from 'models/ccdResponse/ccdWelshLanguageRequirements';
import {CCDVulnerability} from 'models/ccdResponse/ccdVulnerability';
import {CCDSpecificCourtLocations} from 'models/ccdResponse/ccdSpecificCourtLocations';
import {CCDWitnesses} from 'models/ccdResponse/ccdWitnesses';
import {CCDSmallClaimHearing} from 'models/ccdResponse/ccdSmallClaimHearing';
import {CCDExpert} from 'models/ccdResponse/ccdExpert';
import {CCDClaimantLiPResponse} from 'services/translation/claimantResponse/convertToCCDClaimantLiPResponse';
import {CCDMediation} from '../ccdResponse/ccdMediation';

export interface CCDClaimantMediationLip extends CCDMediation {
  hasAgreedFreeMediation?: YesNoUpperCamelCase;
}

export interface CCDClaimantResponse extends ClaimUpdate{
  applicant1DQLanguage?: CCDWelshLanguageRequirements;
  applicant1DQVulnerabilityQuestions?: CCDVulnerability;
  applicant1DQRequestedCourt?: CCDSpecificCourtLocations;
  applicant1DQWitnesses?: CCDWitnesses;
  applicant1DQSmallClaimHearing?: CCDSmallClaimHearing;
  applicant1LiPResponse?: CCDClaimantLiPResponse;
  applicant1ClaimExpertSpecRequired?: YesNoUpperCamelCase;
  applicant1DQExperts?: CCDExpert;
  applicant1AcceptAdmitAmountPaidSpec?: YesNoUpperCamelCase;
  applicant1ClaimMediationSpecRequiredLip?: CCDClaimantMediationLip;
  applicant1ProceedWithClaim : YesNoUpperCamelCase;
  applicant1PartAdmitConfirmAmountPaidSpec: YesNoUpperCamelCase;
  applicant1PartAdmitIntentionToSettleClaimSpec: YesNoUpperCamelCase;
}
