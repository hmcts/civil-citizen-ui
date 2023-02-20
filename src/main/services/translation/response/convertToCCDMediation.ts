import {toCCDYesNo, toCCDYesNoFromGenericYesNo} from 'services/translation/response/convertToCCDYesNo';
import {Mediation} from 'models/mediation/mediation';
import {CCDMediation} from 'models/ccdResponse/ccdMediation';

export const toCCDMediation = (mediation: Mediation): CCDMediation => {
  if (!mediation) return undefined;
  return {
    canWeUseMediationLiP: toCCDYesNo(mediation?.canWeUse?.option),
    canWeUseMediationPhoneLiP: mediation?.canWeUse?.mediationPhoneNumber,
    mediationDisagreementLiP: toCCDYesNoFromGenericYesNo(mediation?.mediationDisagreement),
    noMediationReasonLiP: mediation?.noMediationReason?.iDoNotWantMediationReason,
    noMediationOtherReasonLiP: mediation?.noMediationReason?.otherReason,
    companyTelephoneOptionMediationLiP: toCCDYesNo(mediation?.companyTelephoneNumber?.option),
    companyTelephoneConfirmationMediationLiP: mediation?.companyTelephoneNumber?.mediationPhoneNumberConfirmation,
    companyTelephoneContactPersonMediationLiP: mediation?.companyTelephoneNumber?.mediationContactPerson,
    companyTelephonePhoneNumberMediationLiP: mediation?.companyTelephoneNumber?.mediationPhoneNumber,
  };
};
