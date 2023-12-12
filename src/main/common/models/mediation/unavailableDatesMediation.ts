import {
  IsDate,
  IsIn,
  Max,
  MaxDate,
  Min,
  Validate,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {ValidationArgs} from 'common/form/models/genericForm';
import {DateNotAfterReferenceDate} from 'common/form/validators/dateNotAfterReferenceDate';
import {OptionalDateFourDigitValidator} from 'common/form/validators/optionalDateFourDigitValidator';
import {OptionalDateNotInPastValidator} from 'common/form/validators/optionalDateNotInPastValidator';
import {DateConverter} from 'common/utils/dateConverter';
import {addMonths} from 'common/utils/dateUtils';
import { UnavailableDateType } from '../directionsQuestionnaire/hearing/unavailableDates';

const MAX_MONTHS = 3;

export class UnavailableDatesMediation {
  @ValidateNested()
    items?: UnavailableDatePeriodMediation[];

  [key: string]: UnavailableDatePeriodMediation[];

  constructor(items?: UnavailableDatePeriodMediation[]) {
    this.items = items;
  }
}

export class UnavailableDatePeriodMediation {
  @IsIn(Object.values(UnavailableDateType), {message: 'ERRORS.SELECT_SINGLE_DATE_OR_PERIOD'})
    type?: UnavailableDateType;

  @ValidateIf(o => o.type && ((!!o.startDay && o.startDay < 32 && !!o.startMonth && o.startMonth < 13 && o.startYear > 999) ||
    (!o.startDay && !o.startMonth && !o.startYear)))
  @MaxDate(addMonths(new Date(), MAX_MONTHS), { message: generateErrorMessageForMaxDate })
  @IsDate({ message: generateErrorMessageForIsDate })
  @Validate(OptionalDateNotInPastValidator, {message: generateErrorMessageForDateNotInPastValidator})
  @Validate(DateNotAfterReferenceDate, ['until'], {message: 'ERRORS.ENTER_UNAVAILABILITY_FROM_DATE_BEFORE_TO_DATE'})
    from?: Date;

  @ValidateIf(o => o.type && (o.startDay || o.startMonth || o.startYear))
  @Min(1, { message: generateErrorMessage })
  @Max(31, { message: generateErrorMessage })
    startDay?: number;

  @ValidateIf(o => o.type && (o.startDay || o.startMonth || o.startYear))
  @Min(1, { message: generateErrorMessage })
  @Max(12, { message: generateErrorMessage })
    startMonth?: number;

  @ValidateIf(o => o.type && (o.startDay || o.startMonth || o.startYear))
  @Validate(OptionalDateFourDigitValidator, {message: 'ERRORS.VALID_FOUR_DIGIT_YEAR'})
  @Min(1872, { message: generateErrorMessage })
    startYear?: number;

  @ValidateIf(o => o.type === UnavailableDateType.LONGER_PERIOD && ((!!o.endDay && o.endDay < 32 && !!o.endMonth && o.endMonth < 13 && o.endYear > 999) ||
    (!o.endDay && !o.endMonth && !o.endYear)))
  @MaxDate(addMonths(new Date(), MAX_MONTHS), {message: 'ERRORS.ENTER_UNAVAILABILITY_DATE_IN_NEXT_3_MONTHS_TO'})
  @IsDate({ message: generateErrorMessage })
  @Validate(OptionalDateNotInPastValidator, {message: 'ERRORS.ENTER_UNAVAILABILITY_DATE_IN_FUTURE_TO'})
    until?: Date;

  @ValidateIf(o => o.type === UnavailableDateType.LONGER_PERIOD && (o.endDay || o.endMonth || o.endYear))
  @Min(1, {message: 'ERRORS.ENTER_DAY_FOR_UNAVAILABILITY_TO'})
  @Max(31, {message: 'ERRORS.ENTER_DAY_FOR_UNAVAILABILITY_TO'})
    endDay?: number;

  @ValidateIf(o => o.type === UnavailableDateType.LONGER_PERIOD && (o.endDay || o.endMonth || o.endYear))
  @Min(1, {message: 'ERRORS.ENTER_MONTH_FOR_UNAVAILABILITY_TO'})
  @Max(12, {message: 'ERRORS.ENTER_MONTH_FOR_UNAVAILABILITY_TO'})
    endMonth?: number;

  @ValidateIf(o => o.type === UnavailableDateType.LONGER_PERIOD && (o.endDay || o.endMonth || o.endYear))
  @Validate(OptionalDateFourDigitValidator, {message: 'ERRORS.VALID_FOUR_DIGIT_YEAR'})
  @Min(1872, {message: 'ERRORS.ENTER_YEAR_FOR_UNAVAILABILITY_TO'})
    endYear?: number;

  [key: string]: UnavailableDateType | Date | number;
  constructor(type?: UnavailableDateType, paramsFrom?: Record<string, string>, paramsUntil?: Record<string, string>) {
    this.type = type;
    this.from = DateConverter.convertToDate(paramsFrom?.year, paramsFrom?.month, paramsFrom?.day);
    this.until = DateConverter.convertToDate(paramsUntil?.year, paramsUntil?.month, paramsUntil?.day);
    this.startYear = Number(paramsFrom?.year);
    this.startMonth = Number(paramsFrom?.month);
    this.startDay = Number(paramsFrom?.day);
    this.endYear = Number(paramsUntil?.year);
    this.endMonth = Number(paramsUntil?.month);
    this.endDay = Number(paramsUntil?.day);
  }
}

function generateErrorMessage(args: ValidationArgs<UnavailableDatePeriodMediation>): string {
  switch (args.property) {
    case 'startDay':
      if (args.object.type === UnavailableDateType.SINGLE_DATE) {
        return 'ERRORS.ENTER_DAY_FOR_UNAVAILABILITY';
      }
      return 'ERRORS.ENTER_DAY_FOR_UNAVAILABILITY_FROM';
    case 'startMonth':
      if (args.object.type === UnavailableDateType.SINGLE_DATE) {
        return 'ERRORS.ENTER_MONTH_FOR_UNAVAILABILITY';
      }
      return 'ERRORS.ENTER_MONTH_FOR_UNAVAILABILITY_FROM';
    case 'startYear':
      if (args.object.type === UnavailableDateType.SINGLE_DATE) {
        return 'ERRORS.ENTER_YEAR_FOR_UNAVAILABILITY';
      }
      return 'ERRORS.ENTER_YEAR_FOR_UNAVAILABILITY_FROM';
    case 'until':
      if ((args.object.startDay || args.object.startMonth || args.object.startYear) && !args.object.until) {
        return 'ERRORS.ENTER_DATE_FOR_UNAVAILABILITY_TO';
      }
      if (!args.object.from && !args.object.until) {
        return 'ERRORS.ENTER_DATES_FOR_UNAVAILABILITY';
      }
      break;
    default:
      return 'ERRORS.ENTER_DATE_FOR_UNAVAILABILITY';
  }
}

function generateErrorMessageForMaxDate(args: ValidationArgs<UnavailableDatePeriodMediation>): string {
  if (args.object.type === UnavailableDateType.SINGLE_DATE) {
    return 'ERRORS.ENTER_UNAVAILABILITY_DATE_IN_NEXT_3_MONTHS';
  }
  return 'ERRORS.ENTER_UNAVAILABILITY_DATE_IN_NEXT_3_MONTHS_FROM';
}

function generateErrorMessageForIsDate(args: ValidationArgs<UnavailableDatePeriodMediation>): string {
  if (args.object.type === UnavailableDateType.SINGLE_DATE) {
    return 'ERRORS.ENTER_DATE_FOR_UNAVAILABILITY';
  }
  if (args.object.type === UnavailableDateType.LONGER_PERIOD && (args.object.until || args.object.endDay || args.object.endMonth || args.object.endYear)) {
    return 'ERRORS.ENTER_DATE_FOR_UNAVAILABILITY_FROM';
  }
}

function generateErrorMessageForDateNotInPastValidator(args: ValidationArgs<UnavailableDatePeriodMediation>): string {
  if (args.object.type === UnavailableDateType.SINGLE_DATE) {
    return 'ERRORS.ENTER_UNAVAILABILITY_DATE_IN_FUTURE';
  }
  return 'ERRORS.ENTER_UNAVAILABILITY_DATE_IN_FUTURE_FROM';
}
