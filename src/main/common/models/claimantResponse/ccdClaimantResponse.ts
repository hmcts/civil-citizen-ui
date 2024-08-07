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
import {CCDClaimantPayBySetDate} from 'models/ccdResponse/ccdPayBySetDate';
import {CCDClaimantPaymentOption} from 'models/ccdResponse/ccdClaimantPaymentOption';
import {ClaimantResponseRequestJudgementByAdmissionOrDeterminationToCCD} from 'services/translation/claimantResponse/ccdRequestJudgementTranslation';
import {CcdMediationCarm} from 'models/ccdResponse/ccdMediationCarm';
import {CCDFixedRecoverableCostsIntermediate} from 'models/ccdResponse/ccdFixedRecoverableCostsIntermediate';
import {CCDDisclosureOfElectronicDocuments} from 'models/ccdResponse/ccdDisclosureOfElectronicDocuments';
import {CCDDisclosureOfNonElectronicDocuments} from 'models/ccdResponse/ccdDisclosureOfNonElectronicDocuments';
import {CCDDocumentsToBeConsidered} from 'models/ccdResponse/ccdDocumentsToBeConsidered';

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
  applicant1LiPResponseCarm?: CcdMediationCarm;
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
  applicant1SettleClaim?: YesNoUpperCamelCase;
  applicant1RequestedPaymentDateForDefendantSpec?: CCDClaimantPayBySetDate;
  applicant1SuggestPayImmediatelyPaymentDateForDefendantSpec?: Date;
  applicant1DQFixedRecoverableCostsIntermediate?: CCDFixedRecoverableCostsIntermediate;
  specApplicant1DQDisclosureOfElectronicDocuments?: CCDDisclosureOfElectronicDocuments;
  specApplicant1DQDisclosureOfNonElectronicDocuments?: CCDDisclosureOfNonElectronicDocuments;
  applicant1DQDefendantDocumentsToBeConsidered?: CCDDocumentsToBeConsidered;
}
