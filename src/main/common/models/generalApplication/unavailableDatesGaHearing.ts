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

const MAX_MONTHS = 3;

export enum UnavailableDateType {
  SINGLE_DATE = 'SINGLE_DATE',
  LONGER_PERIOD = 'LONGER_PERIOD',
}

export class UnavailableDatesGaHearing {
  @ValidateNested()
    items?: UnavailableDatePeriodGaHearing[];

  constructor(items?: UnavailableDatePeriodGaHearing[]) {
    this.items = items;
  }
}

export class UnavailableDatePeriodGaHearing {
  @IsIn(Object.values(UnavailableDateType), {message: 'ERRORS.SELECT_SINGLE_DATE_OR_PERIOD'})
    type?: UnavailableDateType;

  @ValidateIf(o => o.type && ((!!o.startDay && o.startDay < 32 && !!o.startMonth && o.startMonth < 13 && o.startYear > 999) ||
    (!o.startDay && !o.startMonth && !o.startYear)))
  @MaxDate(addMonths(new Date(), MAX_MONTHS), { message: generateErrorMessageForMaxDate })
  @IsDate({ message: 'ERRORS.GA_ENTER_A_VALID_DATE' })
  @Validate(OptionalDateNotInPastValidator, {message: generateErrorMessageForDateNotInPastValidator})
  @Validate(DateNotAfterReferenceDate, ['until'], {message: 'ERRORS.GA_ENTER_UNAVAILABILITY_FROM_DATE_BEFORE_TO_DATE'})
    from?: Date;

  @ValidateIf(o => o.type && (o.startDay || o.startMonth || o.startYear))
  @Min(1, { message: 'ERRORS.VALID_DAY' })
  @Max(31, { message: 'ERRORS.VALID_DAY' })
    startDay?: number;

  @ValidateIf(o => o.type && (o.startDay || o.startMonth || o.startYear))
  @Min(1, { message: 'ERRORS.VALID_MONTH' })
  @Max(12, { message: 'ERRORS.VALID_MONTH' })
    startMonth?: number;

  @ValidateIf(o => o.type && (o.startDay || o.startMonth || o.startYear))
  @Validate(OptionalDateFourDigitValidator, {message: 'ERRORS.VALID_FOUR_DIGIT_YEAR'})
    startYear?: number;

  @ValidateIf(o => o.type === UnavailableDateType.LONGER_PERIOD && ((!!o.endDay && o.endDay < 32 && !!o.endMonth && o.endMonth < 13 && o.endYear > 999) ||
    (!o.endDay && !o.endMonth && !o.endYear)))
  @MaxDate(addMonths(new Date(), MAX_MONTHS), {message: 'ERRORS.GA_ENTER_UNAVAILABILITY_DATE_IN_NEXT_3_MONTHS_TO'})
  @IsDate({ message: 'ERRORS.GA_ENTER_A_VALID_DATE' })
  @Validate(OptionalDateNotInPastValidator, {message: 'ERRORS.GA_ENTER_UNAVAILABILITY_DATE_IN_FUTURE_TO'})
    until?: Date;

  @ValidateIf(o => o.type === UnavailableDateType.LONGER_PERIOD && (o.endDay || o.endMonth || o.endYear))
  @Min(1, {message: 'ERRORS.VALID_DAY'})
  @Max(31, {message: 'ERRORS.VALID_DAY'})
    endDay?: number;

  @ValidateIf(o => o.type === UnavailableDateType.LONGER_PERIOD && (o.endDay || o.endMonth || o.endYear))
  @Min(1, {message: 'ERRORS.VALID_MONTH'})
  @Max(12, {message: 'ERRORS.VALID_MONTH'})
    endMonth?: number;

  @ValidateIf(o => o.type === UnavailableDateType.LONGER_PERIOD && (o.endDay || o.endMonth || o.endYear))
  @Validate(OptionalDateFourDigitValidator, {message: 'ERRORS.VALID_FOUR_DIGIT_YEAR'})
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

function generateErrorMessageForMaxDate(args: ValidationArgs<UnavailableDatePeriodGaHearing>): string {
  if (args.object.type === UnavailableDateType.SINGLE_DATE) {
    return 'ERRORS.GA_ENTER_UNAVAILABILITY_DATE_IN_NEXT_3_MONTHS';
  }
  return 'ERRORS.GA_ENTER_UNAVAILABILITY_DATE_IN_NEXT_3_MONTHS_FROM';
}

function generateErrorMessageForDateNotInPastValidator(args: ValidationArgs<UnavailableDatePeriodGaHearing>): string {
  if (args.object.type === UnavailableDateType.SINGLE_DATE) {
    return 'ERRORS.GA_ENTER_UNAVAILABILITY_DATE_IN_FUTURE';
  }
  return 'ERRORS.GA_ENTER_UNAVAILABILITY_DATE_IN_FUTURE_FROM';
}
