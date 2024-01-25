import {toCCDYesNo, toCCDYesNoFromGenericYesNo} from 'services/translation/response/convertToCCDYesNo';
import {Mediation} from 'models/mediation/mediation';
import {CCDMediation} from 'models/ccdResponse/ccdMediation';
import {YesNo} from 'form/models/yesNo';
import {toCCDUnavailableDates} from 'services/translation/response/convertToCCDSmallClaimHearing';

export const toCCDMediation = (mediation: Mediation): CCDMediation => {
  if (!mediation) return undefined;
  return {
    canWeUseMediationLiP: toCCDYesNo(mediation?.canWeUse?.option),
    canWeUseMediationPhoneLiP: mediation?.canWeUse?.mediationPhoneNumber,
    mediationDisagreementLiP: toCCDYesNoFromGenericYesNo(mediation?.mediationDisagreement),
    noMediationReasonLiP: mediation?.noMediationReason?.iDoNotWantMediationReason?.replace('PAGES.I_DON_T_WANT_FREE_MEDIATION.', ''),
    noMediationOtherReasonLiP: mediation?.noMediationReason?.otherReason,
    companyTelephoneOptionMediationLiP: toCCDYesNo(mediation?.companyTelephoneNumber?.option),
    companyTelephoneConfirmationMediationLiP: mediation?.companyTelephoneNumber?.mediationPhoneNumberConfirmation,
    companyTelephoneContactPersonMediationLiP: mediation?.companyTelephoneNumber?.mediationContactPerson,
    companyTelephonePhoneNumberMediationLiP: mediation?.companyTelephoneNumber?.mediationPhoneNumber,
    //new mediation
    isMediationContactNameCorrect: toCCDYesNoFromGenericYesNo(mediation?.isMediationContactNameCorrect),
    alternativeMediationContactPerson: mediation?.isMediationContactNameCorrect?.option === YesNo.NO ? mediation?.alternativeMediationContactPerson.alternativeContactPerson : undefined,
    isMediationEmailCorrect: toCCDYesNoFromGenericYesNo(mediation?.isMediationEmailCorrect),
    alternativeMediationEmail: mediation?.isMediationEmailCorrect?.option === YesNo.NO ? mediation?.alternativeMediationEmail.alternativeEmailAddress : undefined,
    isMediationPhoneCorrect: toCCDYesNoFromGenericYesNo(mediation?.isMediationPhoneCorrect),
    alternativeMediationTelephone: mediation?.isMediationPhoneCorrect?.option === YesNo.NO ? mediation?.alternativeMediationTelephone.alternativeTelephone : undefined,
    hasUnavailabilityNextThreeMonths: toCCDYesNoFromGenericYesNo(mediation.hasUnavailabilityNextThreeMonths),
    unavailableDatesForMediation: mediation?.hasUnavailabilityNextThreeMonths?.option === YesNo.YES ? toCCDUnavailableDates(mediation?.unavailableDatesForMediation.items) : undefined,
  };
};
