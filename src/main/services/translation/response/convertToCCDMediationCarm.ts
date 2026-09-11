import {toCCDYesNoFromGenericYesNo} from 'services/translation/response/convertToCCDYesNo';
import {YesNo} from 'form/models/yesNo';
import {toCCDUnavailableDates} from 'services/translation/response/convertToCCDSmallClaimHearing';
import {CcdMediationCarm} from 'models/ccdResponse/ccdMediationCarm';
import {MediationCarm} from 'models/mediation/mediationCarm';
import {UnavailableDatePeriodMediation} from 'models/mediation/unavailableDatesMediation';
import {DateConverter} from 'common/utils/dateConverter';
import {convertDateToStringFormat} from 'common/utils/dateUtils';

const formatDateForCCD = (date: Date | string): Date => {
  // CCD date fields are modelled as Date here, but the API expects yyyy-MM-dd strings.
  return typeof date === 'string' ? convertDateToStringFormat(date) as unknown as Date : date;
};

const resolveDate = (date: Date | string, year: number, month: number, day: number): Date => {
  if (date) return formatDateForCCD(date);
  if (!year || !month || !day) return undefined;
  const dateFromParts = DateConverter.convertToDate(year.toString(), month.toString(), day.toString());
  return convertDateToStringFormat(dateFromParts) as unknown as Date;
};

const toCCDMediationUnavailableDates = (dateDetails: UnavailableDatePeriodMediation[]) => {
  const unavailableDates = toCCDUnavailableDates(dateDetails?.map(datePeriod => ({
    ...datePeriod,
    from: resolveDate(datePeriod.from, datePeriod.startYear, datePeriod.startMonth, datePeriod.startDay),
    until: resolveDate(datePeriod.until, datePeriod.endYear, datePeriod.endMonth, datePeriod.endDay),
  })));

  return unavailableDates?.map(unavailableDate => ({
    ...unavailableDate,
    value: {
      ...unavailableDate.value,
      date: formatDateForCCD(unavailableDate.value.date),
      fromDate: formatDateForCCD(unavailableDate.value.fromDate),
      toDate: formatDateForCCD(unavailableDate.value.toDate),
    },
  }));
};

export const toCCDMediationCarm = (mediation: MediationCarm): CcdMediationCarm => {
  if (!mediation) return undefined;
  return {
    //new mediation
    isMediationContactNameCorrect: toCCDYesNoFromGenericYesNo(mediation?.isMediationContactNameCorrect),
    alternativeMediationContactPerson: mediation?.isMediationContactNameCorrect?.option === YesNo.NO ? mediation?.alternativeMediationContactPerson?.alternativeContactPerson : undefined,
    isMediationEmailCorrect: toCCDYesNoFromGenericYesNo(mediation?.isMediationEmailCorrect),
    alternativeMediationEmail: mediation?.isMediationEmailCorrect?.option === YesNo.NO ? mediation?.alternativeMediationEmail.alternativeEmailAddress : undefined,
    isMediationPhoneCorrect: toCCDYesNoFromGenericYesNo(mediation?.isMediationPhoneCorrect),
    alternativeMediationTelephone: mediation?.isMediationPhoneCorrect?.option === YesNo.NO ? mediation?.alternativeMediationTelephone.alternativeTelephone : undefined,
    hasUnavailabilityNextThreeMonths: toCCDYesNoFromGenericYesNo(mediation.hasUnavailabilityNextThreeMonths),
    unavailableDatesForMediation: mediation?.hasUnavailabilityNextThreeMonths?.option === YesNo.YES ? toCCDMediationUnavailableDates(mediation?.unavailableDatesForMediation?.items) : undefined,
  };
};
