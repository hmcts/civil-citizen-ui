import { IsDate, MaxDate, ValidateIf } from 'class-validator';
import { CitizenDate } from './citizenDate';
import { getDOBforAgeFromCurrentTime } from 'common/utils/dateUtils';

export class DOBDate extends CitizenDate {
  @ValidateIf(o => (o.day < 32 && o.month < 13 && o.year > 999))
  @IsDate({ message: 'ERRORS.VALID_DATE' })
  @MaxDate(() => getDOBforAgeFromCurrentTime(18), { message: 'ERRORS.VALID_ENTER_A_DATE_BEFORE' })
    date?: Date;

  constructor(day?: string, month?: string, year?: string) {
    super(day, month, year);
    this.date = new Date(new Date(year + '-' + month + '-' + day).setHours(0, 0, 0, 0));
  }
}