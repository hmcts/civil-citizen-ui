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
    isMediationContactNameCorrect: toCCDYesNo(mediation.isMediationContactNameCorrect.option),
    alternativeMediationContactPerson: mediation.isMediationContactNameCorrect.option === YesNo.NO ? mediation.alternativeMediationContactPerson.alternativeContactPerson : undefined,
    isMediationEmailCorrect: toCCDYesNo(mediation.isMediationEmailCorrect?.option),
    alternativeMediationEmail: mediation.isMediationEmailCorrect.option === YesNo.NO ? mediation.alternativeMediationEmail.alternativeEmailAddress : undefined,
    isMediationPhoneCorrect: toCCDYesNo(mediation.isMediationPhoneCorrect.option),
    alternativeMediationTelephone: mediation.isMediationPhoneCorrect.option === YesNo.NO ? mediation.alternativeMediationTelephone.alternativeTelephone : undefined,
    hasUnavailabilityNextThreeMonths: toCCDYesNo(mediation.hasUnavailabilityNextThreeMonths.option),
    unavailableDatesForMediation: mediation.hasUnavailabilityNextThreeMonths.option === YesNo.YES ? toCCDUnavailableDates(mediation.unavailableDatesForMediation.items) : undefined,
  };
};
