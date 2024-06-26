import {IsDate, IsDefined,Validate, ValidateIf} from 'class-validator';
import {DateNotMoreThanDurationValidator} from '../validators/dateNotMoreThanDurationValidator';
import {DateNotBeforeReferenceDate} from '../validators/dateNotBeforeReferenceDate';
import {DateConverter} from '../../utils/dateConverter';
import {BaseDate} from './admission/fullAdmission/baseDate';

export class AgreedResponseDeadline extends BaseDate {
  @ValidateIf(o => (o.day > 0 && o.day < 32 && o.month > 0 && o.month < 13 && o.year > 999) ||
    (!o.day && !o.month && !o.year))
  @IsDefined({message: 'ERRORS.VALID_AGREED_RESPONSE_DATE'})
  @IsDate({message: 'ERRORS.VALID_DATE'})
  @Validate(DateNotBeforeReferenceDate, ['originalResponseDeadline'], {message: 'ERRORS.VALID_AGREED_RESPONSE_DATE_NOT_IN_THE_PAST'})
  @Validate(DateNotMoreThanDurationValidator, ['originalResponseDeadline', 28], {message: 'ERRORS.DATE_NOT_MORE_THAN_28_DAYS'})
    date?: Date;

  originalResponseDeadline: Date;

  constructor(year?: string, month?: string, day?: string, originalResponseDeadline?: Date) {
    super(year, month, day);
    this.date = DateConverter.convertToDate(year, month, day);
    this.originalResponseDeadline = originalResponseDeadline;
  }
}
