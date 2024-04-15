import {IsDate, IsDefined, Max, Min, Validate, ValidateIf, ValidateNested} from 'class-validator';
import {YesNo} from '../../form/models/yesNo';
import {OptionalDateNotInFutureValidator} from 'common/form/validators/optionalDateNotInFutureValidator';
import {OptionalDateFourDigitValidator} from 'common/form/validators/optionalDateFourDigitValidator';
import {DateConverter} from 'common/utils/dateConverter';

export class DelayedFlight {
  @IsDefined({message: 'ERRORS.DELAYED_FLIGHT.CLAIMING_FOR_DELAY_REQUIRED'})
    option?: YesNo;

  @ValidateIf(o => o.option === YesNo.YES)
  @ValidateNested()
    airline?: string;

  @ValidateIf(o => o.option === YesNo.YES)
  @ValidateNested()
    flightNumber?: string;

  @ValidateIf(o => o.option === YesNo.YES)
  @ValidateIf(o => (o.day <32 && o.month<13 && o.year > 999))
  @IsDate({message: 'ERRORS.VALID_DATE'})
  @Validate(OptionalDateNotInFutureValidator, {message: 'ERRORS.VALID_DATE'})
    flightDate?: Date;

  @ValidateIf(o => o.option === YesNo.YES)
  @Min(1872,{message:'ERRORS.VALID_YEAR'})
  @Validate(OptionalDateFourDigitValidator, {message: 'ERRORS.VALID_FOUR_DIGIT_YEAR'})
    year: number;

  @ValidateIf(o => o.option === YesNo.YES)
  @Min(1,{message:'ERRORS.VALID_MONTH'})
  @Max(12,{message:'ERRORS.VALID_MONTH'})
    month: number;

  @ValidateIf(o => o.option === YesNo.YES)
  @Min(1,{message:'ERRORS.VALID_DAY'})
  @Max(31,{message:'ERRORS.VALID_DAY'})
    day: number;
  
    constructor(
      option?: YesNo,
      airline?: string,
      flightNumber?: string,
      year?: number,
      month?: number,
      day?: number,
    ) {
      this.option = option;
      this.airline = airline;
      this.flightNumber = flightNumber;
      this.flightDate = DateConverter.convertToDate(year?.toString(), month?.toString(), day?.toString());
      this.year = year;
      this.month = month;
      this.day = day;
    }
}
