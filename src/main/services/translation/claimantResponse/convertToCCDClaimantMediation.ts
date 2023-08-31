import {Mediation} from 'models/mediation/mediation';
import {toAgreedMediation} from '../response/convertToCCDAgreedMediation';
import {CCDClaimantMediationLip} from 'common/models/claimantResponse/ccdClaimantResponse';
import {toCCDMediation} from '../response/convertToCCDMediation';

export const toCCDClaimantMediation = (mediation: Mediation): CCDClaimantMediationLip => {
  if (!mediation) {
    return undefined;
  };
  const ccdMediation = toCCDMediation(mediation)
  return {
    ...ccdMediation, hasAgreedFreeMediation: toAgreedMediation(mediation),
    // TODO : include all below fields to ccd and civilk-service under ClaimantMediationLip
    // canWeUseMediationLiP: toCCDYesNo(mediation?.canWeUse?.option),
    // canWeUseMediationPhoneLiP: mediation?.canWeUse?.mediationPhoneNumber,
    // mediationDisagreementLiP: toCCDYesNoFromGenericYesNo(mediation?.mediationDisagreement),
    // noMediationReasonLiP: mediation?.noMediationReason?.iDoNotWantMediationReason,
    // noMediationOtherReasonLiP: mediation?.noMediationReason?.otherReason,
    // companyTelephoneOptionMediationLiP: toCCDYesNo(mediation?.companyTelephoneNumber?.option),
    // companyTelephoneConfirmationMediationLiP: mediation?.companyTelephoneNumber?.mediationPhoneNumberConfirmation,
    // companyTelephoneContactPersonMediationLiP: mediation?.companyTelephoneNumber?.mediationContactPerson,
    // companyTelephonePhoneNumberMediationLiP: mediation?.companyTelephoneNumber?.mediationPhoneNumber,
  };
};
