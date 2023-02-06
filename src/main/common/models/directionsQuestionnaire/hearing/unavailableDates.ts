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
import {OptionalDateFourDigitValidator} from 'common/form/validators/optionalDateFourDigitValidator';
import {OptionalDateNotInPastValidator} from 'common/form/validators/optionalDateNotInPastValidator';
import {DateConverter} from 'common/utils/dateConverter';
import {addMonths} from 'common/utils/dateUtils';

export enum UnavailableDateType {
  SINGLE_DATE = 'SINGLE_DATE',
  LONGER_PERIOD = 'LONGER_PERIOD',
}

export class UnavailableDates {
  @ValidateNested()
    items?: UnavailableDatePeriod[];

  [key: string]: UnavailableDatePeriod[];

  constructor(items?: UnavailableDatePeriod[]) {
    this.items = items;
  }
}

export class UnavailableDatePeriod {
  @IsIn(Object.values(UnavailableDateType), {message: 'ERRORS.SELECT_SINGLE_DATE_OR_PERIOD'})
    type?: UnavailableDateType;

  @ValidateIf(o => o.type && ((!!o.startDay && o.startDay < 32 && !!o.startMonth && o.startMonth < 13 && o.startYear > 999) ||
    (!o.startDay && !o.startMonth && !o.startYear)))
  @MaxDate(addMonths(new Date(), 12), {message: 'ERRORS.ENTER_UNAVAILABILITY_DATE_IN_NEXT_12_MOINTHS'})
  @IsDate({message: 'ERRORS.ENTER_DATE_FOR_UNAVAILABILITY'})
  @Validate(OptionalDateNotInPastValidator, {message: 'ERRORS.ENTER_UNAVAILABILITY_DATE_IN_FUTURE'})
    from?: Date;

  @ValidateIf(o => o.type && (o.startDay || o.startMonth || o.startYear))
  @Min(1, {message: 'ERRORS.ENTER_DAY_FOR_UNAVAILABILITY'})
  @Max(31, {message: 'ERRORS.ENTER_DAY_FOR_UNAVAILABILITY'})
    startDay?: number;

  @ValidateIf(o => o.type && (o.startDay || o.startMonth || o.startYear))
  @Min(1, {message: 'ERRORS.ENTER_MONTH_FOR_UNAVAILABILITY'})
  @Max(12, {message: 'ERRORS.ENTER_MONTH_FOR_UNAVAILABILITY'})
    startMonth?: number;

  @ValidateIf(o => o.type && (o.startDay || o.startMonth || o.startYear))
  @Validate(OptionalDateFourDigitValidator, {message: 'ERRORS.VALID_FOUR_DIGIT_YEAR'})
  @Min(1872, {message: 'ERRORS.ENTER_YEAR_FOR_UNAVAILABILITY'})
    startYear?: number;

  @ValidateIf(o => (o.endDay < 32 && o.endMonth < 13 && o.endYear > 999))
  @IsDate({message: 'ERRORS.ENTER_DATE_FOR_UNAVAILABILITY'})
    until?: Date;

  @ValidateIf(o => o.type === UnavailableDateType.LONGER_PERIOD)
  @Min(1, {message: 'ERRORS.VALID_DAY'})
  @Max(31, {message: 'ERRORS.VALID_DAY'})
    endDay?: number;

  @ValidateIf(o => o.type === UnavailableDateType.LONGER_PERIOD)
  @Min(1, {message: 'ERRORS.VALID_MONTH'})
  @Max(12, {message: 'ERRORS.VALID_MONTH'})
    endMonth?: number;

  @ValidateIf(o => o.type === UnavailableDateType.LONGER_PERIOD)
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
