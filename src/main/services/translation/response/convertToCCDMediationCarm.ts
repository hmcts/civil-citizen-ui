import {toCCDYesNoFromGenericYesNo} from 'services/translation/response/convertToCCDYesNo';
import {YesNo} from 'form/models/yesNo';
import {toCCDUnavailableDates} from 'services/translation/response/convertToCCDSmallClaimHearing';
import {CcdMediationCarm} from "models/ccdResponse/ccdMediationCarm";
import {MediationCarm} from "models/mediation/mediationCarm";

export const toCCDMediationCarm = (mediation: MediationCarm): CcdMediationCarm => {
  if (!mediation) return undefined;
  return {
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
