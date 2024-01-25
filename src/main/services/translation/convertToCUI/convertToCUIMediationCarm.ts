import {toCUIGenericYesNo} from 'services/translation/convertToCUI/convertToCUIYesNo';
import {CcdMediationCarm} from "models/ccdResponse/ccdMediationCarm";
import {MediationCarm} from "models/mediation/mediationCarm";
import {AlternativeContactPerson} from "form/models/mediation/alternativeContactPerson";
import {AlternativeEmailAddress} from "form/models/mediation/AlternativeEmailAddress";
import {AlternativeTelephone} from "form/models/mediation/AlternativeTelephone";
// import {CCDUnavailableDates, CCDUnavailableDateType} from "models/ccdResponse/ccdSmallClaimHearing";
// import {UnavailableDateType} from "models/directionsQuestionnaire/hearing/unavailableDates";
// import {UnavailableDatesMediation} from "models/mediation/unavailableDatesMediation";

export const toCUIMediationCarm = (ccdMediationCarm: CcdMediationCarm): MediationCarm => {
  if (!ccdMediationCarm) return undefined;
  const mediation : MediationCarm = new MediationCarm();
  mediation.isMediationContactNameCorrect = toCUIGenericYesNo(ccdMediationCarm.isMediationContactNameCorrect);
  mediation.alternativeMediationContactPerson = toAlternativeContactPerson(ccdMediationCarm);
  mediation.isMediationEmailCorrect = toCUIGenericYesNo(ccdMediationCarm.isMediationEmailCorrect);
  mediation.alternativeMediationEmail = toAlternativeMediationEmail(ccdMediationCarm);
  mediation.isMediationPhoneCorrect = toCUIGenericYesNo(ccdMediationCarm.isMediationPhoneCorrect);
  mediation.alternativeMediationTelephone = toAlternativeMediationTelephone(ccdMediationCarm)
  mediation.hasUnavailabilityNextThreeMonths = toCUIGenericYesNo(ccdMediationCarm.hasUnavailabilityNextThreeMonths);
  // mediation.unavailableDatesForMediation = UnavailableDatesMediation(ccdMediationCarm.unavailableDatesForMediation);
  return mediation;
};

function toAlternativeContactPerson(mediation: CcdMediationCarm) : AlternativeContactPerson {
  return new AlternativeContactPerson(
    mediation.alternativeMediationContactPerson
  );
}

function toAlternativeMediationEmail(mediation: CcdMediationCarm) : AlternativeEmailAddress {
  return new AlternativeEmailAddress(
    mediation.alternativeMediationEmail
  );
}

function toAlternativeMediationTelephone(mediation: CcdMediationCarm) : AlternativeTelephone {
  return new AlternativeTelephone(
    mediation.alternativeMediationTelephone
  );
}

// function toCCDUnavailableDateType(type: UnavailableDateType) {
//   switch(type) {
//     case 'SINGLE_DATE':
//       return CCDUnavailableDateType.SINGLE_DATE;
//     case  'LONGER_PERIOD':
//       return CCDUnavailableDateType.DATE_RANGE;
//     default:
//       return undefined;
//   }
// }
//
// export function toCCDUnavailableDates(dateDetails: CCDUnavailableDates[]) {
//   if (!dateDetails?.length) return undefined;
//   const unavailableDatesForMediation = dateDetails.map((ccdUnavailableDates: CCDUnavailableDates) => {
//     return {
//       id: ccdUnavailableDates?.id,
//       value: ccdUnavailableDates?.value
//     };
//   });
//   return unavailableDatesForMediation;
// }




