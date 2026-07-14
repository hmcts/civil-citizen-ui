import {IsDate, IsOptional, MaxLength, Validate, ValidateIf} from 'class-validator';
import {DateConverter} from 'common/utils/dateConverter';
import {ExitDateValidator} from 'common/form/validators/breathingSpace/exitDateValidator';
import {BreathingSpaceType} from 'common/models/breathingSpace/breathingSpace';

export class ExitBreathingSpaceForm {
  @ValidateIf(o => (o.day || o.month || o.year))
  @IsDate({message: 'ERRORS.VALID_DATE'})
  @Validate(ExitDateValidator)
    date?: Date;

  year?: number;
  month?: number;
  day?: number;

  @IsOptional()
  @MaxLength(1000, {message: 'ERRORS.TEXT_TOO_LONG'})
    reason?: string;

  breathingSpaceStartDate?: Date;
  breathingSpaceType?: BreathingSpaceType;

  constructor(day?: string, month?: string, year?: string, reason?: string, breathingSpaceStartDate?: Date, breathingSpaceType?: BreathingSpaceType) {
    this.date = DateConverter.convertToDate(year, month, day);
    this.year = year ? Number(year) : undefined;
    this.month = month ? Number(month) : undefined;
    this.day = day ? Number(day) : undefined;
    this.reason = reason;
    this.breathingSpaceStartDate = breathingSpaceStartDate;
    this.breathingSpaceType = breathingSpaceType;
  }
}
