import {IsDate, Validate, ValidateIf} from 'class-validator';
import {DateConverter} from 'common/utils/dateConverter';
import {BaseDate} from '../admission/fullAdmission/baseDate';
import {OptionalDateNotInFutureValidator} from 'form/validators/optionalDateNotInFutureValidator';

export class LiftBreathingSpaceForm extends BaseDate {

  @ValidateIf(o => (o.day > 0 && o.day < 32 && o.month > 0 && o.month < 13 && o.year > 999))
  @IsDate({message: 'ERRORS.VALID_DATE'})
  @Validate(OptionalDateNotInFutureValidator, {message: 'ERRORS.VALID_DATE_NOT_IN_FUTURE'})
    date?: Date;

  text?: string;

  constructor(year?: string, month?: string, day?: string, text?: string) {
    super(year, month, day);
    this.date = DateConverter.convertToDate(year, month, day);
    this.text = text;
  }
}
