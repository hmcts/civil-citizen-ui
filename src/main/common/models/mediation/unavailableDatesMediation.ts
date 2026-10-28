import {
  IsDate,
  IsIn,
  Max,
  MaxDate,
  Min,
  Validate,
  ValidateIf,
  ValidateNested,
  ValidationArguments,
  ValidatorConstraint,
} from 'class-validator';
import {ValidationArgs} from 'common/form/models/genericForm';
import {DateNotAfterReferenceDate} from 'common/form/validators/dateNotAfterReferenceDate';
import {OptionalDateFourDigitValidator} from 'common/form/validators/optionalDateFourDigitValidator';
import {OptionalDateNotInPastValidator} from 'common/form/validators/optionalDateNotInPastValidator';
import {DateConverter} from 'common/utils/dateConverter';
import {addMonths, isInvalidDate, getYearErrorMessage} from 'common/utils/dateUtils';
import {toOptionalNumber} from 'common/utils/numberConverter';
import { UnavailableDateType } from '../directionsQuestionnaire/hearing/unavailableDates';

const MAX_MONTHS = 3;

@ValidatorConstraint({name: 'dateNotAfterValidUntilDateValidator', async: false})
class DateNotAfterValidUntilDate extends DateNotAfterReferenceDate {
  validate(inputDate: Date, validationArguments?: ValidationArguments) {
    return !hasValidEndDateParts(validationArguments.object as UnavailableDatePeriodMediation)
      || super.validate(inputDate, validationArguments);
  }
}

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

  @ValidateIf(o => o.type && ((!!o.startDay && o.startDay < 32 && !!o.startMonth && o.startMonth < 13 && o.startYear > 999 && o.startYear < 10000) ||
    !hasStartDateInput(o)))
  @MaxDate(addMonths(new Date(), MAX_MONTHS), { message: generateErrorMessageForMaxDate })
  @IsDate({ message: generateErrorMessageForIsDate })
  @Validate(OptionalDateNotInPastValidator, {message: generateErrorMessageForDateNotInPastValidator})
  @Validate(DateNotAfterValidUntilDate, ['until'], {message: 'ERRORS.CARM_ENTER_UNAVAILABILITY_FROM_DATE_BEFORE_TO_DATE'})
    from?: Date;

  @ValidateIf(o => o.type && hasStartDateInput(o))
  @Min(1, { message: generateErrorMessage })
  @Max(31, { message: generateErrorMessage })
    startDay?: number;

  @ValidateIf(o => o.type && hasStartDateInput(o))
  @Min(1, { message: generateErrorMessage })
  @Max(12, { message: generateErrorMessage })
    startMonth?: number;

  @ValidateIf(o => o.type && hasStartDateInput(o))
  @Validate(OptionalDateFourDigitValidator, {message: 'ERRORS.VALID_FOUR_DIGIT_YEAR'})
  @Min(1872, { message: generateErrorMessage })
  @Max(9999, { message: generateErrorMessage })
    startYear?: number;

  @ValidateIf(o => o.type === UnavailableDateType.LONGER_PERIOD && (hasValidEndDateParts(o) ||
    !hasEndDateInput(o)))
  @MaxDate(addMonths(new Date(), MAX_MONTHS), {message: 'ERRORS.CARM_ENTER_UNAVAILABILITY_DATE_IN_NEXT_3_MONTHS_TO'})
  @IsDate({ message: generateErrorMessage })
  @Validate(OptionalDateNotInPastValidator, {message: 'ERRORS.CARM_ENTER_UNAVAILABILITY_DATE_IN_FUTURE_TO'})
    until?: Date;

  @ValidateIf(o => o.type === UnavailableDateType.LONGER_PERIOD && hasEndDateInput(o))
  @Min(1, { message: generateErrorMessage })
  @Max(31, { message: generateErrorMessage })
    endDay?: number;

  @ValidateIf(o => o.type === UnavailableDateType.LONGER_PERIOD && hasEndDateInput(o))
  @Min(1, { message: generateErrorMessage })
  @Max(12, { message: generateErrorMessage })
    endMonth?: number;

  @ValidateIf(o => o.type === UnavailableDateType.LONGER_PERIOD && hasEndDateInput(o))
  @Validate(OptionalDateFourDigitValidator, {message: 'ERRORS.VALID_FOUR_DIGIT_YEAR'})
  @Min(1872, { message: generateErrorMessage })
  @Max(9999, { message: generateErrorMessage })
    endYear?: number;

  [key: string]: UnavailableDateType | Date | number;
  constructor(type?: UnavailableDateType, paramsFrom?: Record<string, string>, paramsUntil?: Record<string, string>) {
    this.type = type;
    this.from = DateConverter.convertToDate(paramsFrom?.year, paramsFrom?.month, paramsFrom?.day);
    this.until = DateConverter.convertToDate(paramsUntil?.year, paramsUntil?.month, paramsUntil?.day);
    this.startYear = toOptionalNumber(paramsFrom?.year);
    this.startMonth = toOptionalNumber(paramsFrom?.month);
    this.startDay = toOptionalNumber(paramsFrom?.day);
    this.endYear = toOptionalNumber(paramsUntil?.year);
    this.endMonth = toOptionalNumber(paramsUntil?.month);
    this.endDay = toOptionalNumber(paramsUntil?.day);
  }
}

function hasStartDateInput(o: UnavailableDatePeriodMediation): boolean {
  return o.startDay !== undefined || o.startMonth !== undefined || o.startYear !== undefined;
}

function hasEndDateInput(o: UnavailableDatePeriodMediation): boolean {
  return o.endDay !== undefined || o.endMonth !== undefined || o.endYear !== undefined;
}

function hasValidEndDateParts(o: UnavailableDatePeriodMediation): boolean {
  return !!o.endDay && o.endDay < 32 && !!o.endMonth && o.endMonth < 13 && o.endYear >= 1872 && o.endYear < 10000;
}

function generateErrorMessage(args: ValidationArgs<UnavailableDatePeriodMediation>): string {
  const hasValue = args.value !== undefined;
  switch (args.property) {
    case 'startDay':
      if (args.object.type === UnavailableDateType.SINGLE_DATE) {
        return hasValue ? 'ERRORS.CARM_VALID_DAY_FOR_UNAVAILABILITY' : 'ERRORS.CARM_ENTER_DAY_FOR_UNAVAILABILITY';
      }
      return hasValue ? 'ERRORS.CARM_VALID_DAY_FOR_UNAVAILABILITY_FROM' : 'ERRORS.CARM_ENTER_DAY_FOR_UNAVAILABILITY_FROM';
    case 'startMonth':
      if (args.object.type === UnavailableDateType.SINGLE_DATE) {
        return hasValue ? 'ERRORS.CARM_VALID_MONTH_FOR_UNAVAILABILITY' : 'ERRORS.CARM_ENTER_MONTH_FOR_UNAVAILABILITY';
      }
      return hasValue ? 'ERRORS.CARM_VALID_MONTH_FOR_UNAVAILABILITY_FROM' : 'ERRORS.CARM_ENTER_MONTH_FOR_UNAVAILABILITY_FROM';
    case 'startYear':
      if (args.object.type === UnavailableDateType.SINGLE_DATE) {
        return getYearErrorMessage(args.value, 'ERRORS.CARM_ENTER_YEAR_FOR_UNAVAILABILITY', 'ERRORS.CARM_VALID_YEAR_FOR_UNAVAILABILITY');
      }
      return getYearErrorMessage(args.value, 'ERRORS.CARM_ENTER_YEAR_FOR_UNAVAILABILITY_FROM', 'ERRORS.CARM_VALID_YEAR_FOR_UNAVAILABILITY_FROM');
    case 'endDay':
      return hasValue ? 'ERRORS.CARM_VALID_DAY_FOR_UNAVAILABILITY_TO' : 'ERRORS.CARM_ENTER_DAY_FOR_UNAVAILABILITY_TO';
    case 'endMonth':
      return hasValue ? 'ERRORS.CARM_VALID_MONTH_FOR_UNAVAILABILITY_TO' : 'ERRORS.CARM_ENTER_MONTH_FOR_UNAVAILABILITY_TO';
    case 'endYear':
      return getYearErrorMessage(args.value, 'ERRORS.CARM_ENTER_YEAR_FOR_UNAVAILABILITY_TO', 'ERRORS.CARM_VALID_YEAR_FOR_UNAVAILABILITY_TO');
    case 'until':
      // Day, month and year are each in range here, so an invalid date means the day doesn't exist in that month (e.g. 31/02)
      if (isInvalidDate(args.value)) {
        return 'ERRORS.CARM_VALID_DAY_FOR_UNAVAILABILITY_TO';
      }
      if ((args.object.startDay || args.object.startMonth || args.object.startYear) && !args.object.until) {
        return 'ERRORS.CARM_ENTER_DATE_FOR_UNAVAILABILITY_TO';
      }
      if (!args.object.from && !args.object.until) {
        return 'ERRORS.CARM_ENTER_DATES_FOR_UNAVAILABILITY';
      }
      return 'ERRORS.CARM_ENTER_DATE_FOR_UNAVAILABILITY_TO';
    default:
      return 'ERRORS.CARM_ENTER_DATE_FOR_UNAVAILABILITY';
  }
}

function generateErrorMessageForMaxDate(args: ValidationArgs<UnavailableDatePeriodMediation>): string {
  if (args.object.type === UnavailableDateType.SINGLE_DATE) {
    return 'ERRORS.CARM_ENTER_UNAVAILABILITY_DATE_IN_NEXT_3_MONTHS';
  }
  return 'ERRORS.CARM_ENTER_UNAVAILABILITY_DATE_IN_NEXT_3_MONTHS_FROM';
}

function generateErrorMessageForIsDate(args: ValidationArgs<UnavailableDatePeriodMediation>): string {
  // Day, month and year are each in range here, so an invalid date means the day doesn't exist in that month (e.g. 31/02)
  if (isInvalidDate(args.value)) {
    return args.object.type === UnavailableDateType.SINGLE_DATE
      ? 'ERRORS.CARM_VALID_DAY_FOR_UNAVAILABILITY'
      : 'ERRORS.CARM_VALID_DAY_FOR_UNAVAILABILITY_FROM';
  }
  if (args.object.type === UnavailableDateType.SINGLE_DATE) {
    return 'ERRORS.CARM_ENTER_DATE_FOR_UNAVAILABILITY';
  }
  if (args.object.type === UnavailableDateType.LONGER_PERIOD && (args.object.until || args.object.endDay || args.object.endMonth || args.object.endYear)) {
    return 'ERRORS.CARM_ENTER_DATE_FOR_UNAVAILABILITY_FROM';
  }
}

function generateErrorMessageForDateNotInPastValidator(args: ValidationArgs<UnavailableDatePeriodMediation>): string {
  if (args.object.type === UnavailableDateType.SINGLE_DATE) {
    return 'ERRORS.CARM_ENTER_UNAVAILABILITY_DATE_IN_FUTURE';
  }
  return 'ERRORS.CARM_ENTER_UNAVAILABILITY_DATE_IN_FUTURE_FROM';
}
