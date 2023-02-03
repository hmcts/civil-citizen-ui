import {
  IsDate,
  // IsDefined,
  // IsNotEmpty,
  Max, Min,
  Validate,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {OptionalDateFourDigitValidator} from 'common/form/validators/optionalDateFourDigitValidator';
import {DateConverter} from 'common/utils/dateConverter';
// import {AtLeastOneCheckboxSelectedValidator} from '../../../form/validators/atLeastOneCheckboxSelectedValidator';

export class UnavailableDates {
  @ValidateNested()
    items?: UnavailableDatePeriod[];

  [key: string]: UnavailableDatePeriod[];

  constructor(items?: UnavailableDatePeriod[]) {
    this.items = items;
  }
}

export class UnavailableDatePeriod {

  @ValidateIf(o => (o.startDay < 32 && o.startMonth < 13 && o.startYear > 999))
  @IsDate({message: 'ERRORS.VALID_DATE'})
    fromDate?: Date;

  @Min(1, {message: 'ERRORS.VALID_DAY'})
  @Max(31, {message: 'ERRORS.VALID_DAY'})
    startDay?: number;

  @Min(1, {message: 'ERRORS.VALID_MONTH'})
  @Max(12, {message: 'ERRORS.VALID_MONTH'})
    startMonth?: number;

  @Min((new Date().getFullYear() - 150), {message: 'ERRORS.VALID_YEAR'})
  @Validate(OptionalDateFourDigitValidator, {message: 'ERRORS.VALID_FOUR_DIGIT_YEAR'})
    startYear?: number;

  @ValidateIf(o => (o.endDay < 32 && o.endMonth < 13 && o.endYear > 999))
  @IsDate({message: 'ERRORS.VALID_DATE'})
    untilDate?: Date;

  @ValidateIf(o => (o.untilDate))
  @Min(1, {message: 'ERRORS.VALID_DAY'})
  @Max(31, {message: 'ERRORS.VALID_DAY'})
    endDay?: number;

  @ValidateIf(o => (o.untilDate))
  @Min(1, {message: 'ERRORS.VALID_MONTH'})
  @Max(12, {message: 'ERRORS.VALID_MONTH'})
    endMonth?: number;

  @ValidateIf(o => (o.untilDate))
  @Min((new Date().getFullYear() - 150), {message: 'ERRORS.VALID_YEAR'})
  @Validate(OptionalDateFourDigitValidator, {message: 'ERRORS.VALID_FOUR_DIGIT_YEAR'})
    endYear?: number;

  [key: string]: Date | number;
  constructor(paramsStart?: Record<string, string>, paramsEnd?: Record<string, string>) {
    this.fromDate = DateConverter.convertToDate(paramsStart?.year, paramsStart?.month, paramsStart?.day);
    this.untilDate = DateConverter.convertToDate(paramsEnd?.year, paramsEnd?.month, paramsEnd?.day);
    this.startYear = Number(paramsStart?.year);
    this.startMonth = Number(paramsStart?.month);
    this.startDay = Number(paramsStart?.day);
    this.endYear = Number(paramsEnd?.year);
    this.endMonth = Number(paramsEnd?.month);
    this.endDay = Number(paramsEnd?.day);
  }
  //TODO : create a method to find the type of date is it single or period comparing from date equal until date
  // if the interval betwween dates are --> 0
  // use -->getNumberOfDaysBetweenTwoDays
}

export enum UnavailableDatesType {
  SINGLE_DATE = 'SINGLE_DATE',
  LONGER_PERIOD = ' LONGER_PERIOD',
}

// export class Support {
//   sourceName?: string;
//   selected?: boolean;
//   @ValidateIf(o => o.selected)
//   @IsDefined({message: withMessage(generateErrorMessage)})
//   @IsNotEmpty({message: withMessage(generateErrorMessage)})
//     content?: string;

//   [key: string]: boolean | string;
//   constructor(sourceName?: string, selected?: boolean, content?: string) {
//     this.sourceName = sourceName;
//     this.selected = selected;
//     this.content = content;
//   }
// }

// function generateErrorMessage(sourceName: string): string {
//   switch (sourceName) {
//     case SupportType.SIGN_LANGUAGE_INTERPRETER:
//       return 'ERRORS.NO_SIGN_LANGUAGE_ENTERED';
//     case SupportType.LANGUAGE_INTERPRETER:
//       return 'ERRORS.NO_LANGUAGE_ENTERED';
//     default:
//       return 'ERRORS.NO_OTHER_SUPPORT';
//   }
// }

// function withMessage(buildErrorFn: (sourceName: string) => string) {
//   return (args: any): string => {
//     return buildErrorFn(args.object.sourceName);
//   };
// }

// export enum SupportType {
//   SIGN_LANGUAGE_INTERPRETER = 'signLanguageInterpreter',
//   LANGUAGE_INTERPRETER = 'languageInterpreter',
//   OTHER_SUPPORT = 'otherSupport',
// }

// export interface SupportRequiredParams {
//   fullName?: string,
//   disabledAccess?: Support,
//   hearingLoop?: Support,
//   signLanguageInterpreter?: Support,
//   languageInterpreter?: Support,
//   otherSupport?: Support,
//   declared?: string,
// }