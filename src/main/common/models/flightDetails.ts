import {IsDate, IsNotEmpty, Max, Min, Validate, ValidateIf} from 'class-validator';
import {OptionalDateNotInFutureValidator} from 'common/form/validators/optionalDateNotInFutureValidator';
import {OptionalDateFourDigitValidator} from 'common/form/validators/optionalDateFourDigitValidator';
import {DateConverter} from 'common/utils/dateConverter';

export class FlightDetails {

  @IsNotEmpty({message: 'ERRORS.FLIGHT_DETAILS.AIRLINE_REQUIRED'})
    airline?: string;

  @IsNotEmpty({message: 'ERRORS.FLIGHT_DETAILS.FLIGHT_NUMBER_REQUIRED'})
    flightNumber?: string;
    
  @ValidateIf(o => (o.day && o.month && o.year && o.day <32 && o.month<13 && o.year > 999))
  @IsDate({message: 'ERRORS.VALID_DATE'})
  @Validate(OptionalDateNotInFutureValidator, {message: 'ERRORS.FLIGHT_DETAILS.DATE_FLIGHT_PAST'})
    flightDate?: Date;

  @Min(1872,{message:'ERRORS.VALID_YEAR'})
  @Validate(OptionalDateFourDigitValidator, {message: 'ERRORS.VALID_FOUR_DIGIT_YEAR'})
    year: number;

  @Min(1,{message:'ERRORS.VALID_MONTH'})
  @Max(12,{message:'ERRORS.VALID_MONTH'})
    month: number;

  @Min(1,{message:'ERRORS.VALID_DAY'})
  @Max(31,{message:'ERRORS.VALID_DAY'})
    day: number;

  constructor(
    airline?: string,
    flightNumber?: string,
    year?: string,
    month?: string,
    day?: string,
  ) {
    this.airline = airline;
    this.flightNumber = flightNumber;
    this.flightDate = DateConverter.convertToDate(year, month, day);
    this.year = Number(year);
    this.month = Number(month);
    this.day = Number(day);
  }
}
