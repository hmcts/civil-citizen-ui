import {ClaimUpdate} from 'models/events/eventDto';
import {YesNoUpperCamelCase} from 'common/form/models/yesNo';
import {CCDWelshLanguageRequirements} from 'models/ccdResponse/ccdWelshLanguageRequirements';
import {CCDVulnerability} from 'models/ccdResponse/ccdVulnerability';
import {CCDSpecificCourtLocations} from 'models/ccdResponse/ccdSpecificCourtLocations';
import {CCDWitnesses} from 'models/ccdResponse/ccdWitnesses';
import {CCDSmallClaimHearing} from 'models/ccdResponse/ccdSmallClaimHearing';
import {CCDDQSupportRequirements, CCDExpert} from 'models/ccdResponse/ccdExpert';
import {CCDClaimantLiPResponse} from 'services/translation/claimantResponse/convertToCCDClaimantLiPResponse';
import {CCDMediation} from '../ccdResponse/ccdMediation';
import {CCDRepaymentPlanFrequency} from 'models/ccdResponse/ccdRepaymentPlan';
import {CCDClaimantPayBySetDate} from 'models/ccdResponse/ccdPayBySetDate';
import {CCDClaimantPaymentOption} from 'models/ccdResponse/ccdClaimantPaymentOption';
import {ClaimantResponseRequestJudgementByAdmissionOrDeterminationToCCD} from 'services/translation/claimantResponse/ccdRequestJudgementTranslation';

export interface CCDClaimantMediationLip extends CCDMediation {
  hasAgreedFreeMediation?: YesNoUpperCamelCase;
}

export interface CCDClaimantResponse extends ClaimUpdate, ClaimantResponseRequestJudgementByAdmissionOrDeterminationToCCD {
  applicant1DQLanguage?: CCDWelshLanguageRequirements;
  applicant1DQVulnerabilityQuestions?: CCDVulnerability;
  applicant1DQRequestedCourt?: CCDSpecificCourtLocations;
  applicant1DQWitnesses?: CCDWitnesses;
  applicant1DQSmallClaimHearing?: CCDSmallClaimHearing;
  applicant1LiPResponse?: CCDClaimantLiPResponse;
  applicant1ClaimExpertSpecRequired?: YesNoUpperCamelCase;
  applicant1DQExperts?: CCDExpert;
  applicant1DQHearingSupport?: CCDDQSupportRequirements;
  applicant1AcceptAdmitAmountPaidSpec?: YesNoUpperCamelCase;
  applicant1ClaimMediationSpecRequiredLip?: CCDClaimantMediationLip;
  applicant1AcceptFullAdmitPaymentPlanSpec?: YesNoUpperCamelCase;
  applicant1AcceptPartAdmitPaymentPlanSpec?: YesNoUpperCamelCase;
  applicant1RepaymentOptionForDefendantSpec?: CCDClaimantPaymentOption;
  applicant1PartAdmitIntentionToSettleClaimSpec?: YesNoUpperCamelCase;
  applicant1PartAdmitConfirmAmountPaidSpec?: YesNoUpperCamelCase;
  applicant1FullDefenceConfirmAmountPaidSpec?: YesNoUpperCamelCase;
  applicant1ProceedWithClaim?: YesNoUpperCamelCase;
  applicant1SuggestInstalmentsPaymentAmountForDefendantSpec?: number;
  applicant1SuggestInstalmentsRepaymentFrequencyForDefendantSpec?: CCDRepaymentPlanFrequency;
  applicant1SuggestInstalmentsFirstRepaymentDateForDefendantSpec?: string;
  applicant1RequestedPaymentDateForDefendantSpec?: CCDClaimantPayBySetDate;
}
