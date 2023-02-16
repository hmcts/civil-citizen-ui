import {toCCDYesNo, toCCDYesNoFromGenericYesNo} from 'services/translation/response/convertToCCDYesNo';
import {Mediation} from 'models/mediation/mediation';
import {CCDMediation} from 'models/ccdResponse/ccdMediation';

export const toCCDMediation = (mediation: Mediation): CCDMediation => {
  return {
    canWeUseMediationCui: toCCDYesNo(mediation?.canWeUse?.option),
    canWeUseMediationPhoneCui: mediation?.canWeUse?.mediationPhoneNumber,
    mediationDisagreementCui: toCCDYesNoFromGenericYesNo(mediation?.mediationDisagreement),
    noMediationReasonCui: mediation?.noMediationReason?.iDoNotWantMediationReason,
    noMediationOtherReasonCui: mediation?.noMediationReason?.otherReason,
    companyTelephoneOptionMediationCui: toCCDYesNo(mediation?.companyTelephoneNumber?.option),
    companyTelephoneConfirmationMediationCui: mediation?.companyTelephoneNumber?.mediationPhoneNumberConfirmation,
    companyTelephoneContactPersonMediationCui: mediation?.companyTelephoneNumber?.mediationContactPerson,
    companyTelephonePhoneNumberMediationCui: mediation?.companyTelephoneNumber?.mediationPhoneNumber,
  };
};
