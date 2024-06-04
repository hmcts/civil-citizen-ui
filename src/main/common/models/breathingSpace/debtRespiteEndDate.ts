import {IsDate,Validate, ValidateIf} from 'class-validator';
import {OptionalDateNotInPastValidator} from 'form/validators/optionalDateNotInPastValidator';
import {DateConverter} from 'common/utils/dateConverter';
import { BaseDate } from 'common/form/models/admission/fullAdmission/baseDate';

export class DebtRespiteEndDate extends BaseDate {

  @ValidateIf(o => (o.day > 0 && o.day <32 && o.month > 0 && o.month < 13 && o.year > 1871))
  @IsDate({message: 'ERRORS.VALID_DATE'})
  @Validate(OptionalDateNotInPastValidator, {message: 'ERRORS.VALID_DEBT_RESPITE_END_DATE'})
    date?: Date;

  constructor(day?: string, month?: string, year?: string) {
    super(year, month, day);
    this.date = DateConverter.convertToDate(year, month, day);
  }
}
