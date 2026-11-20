import {IsDate, IsDefined, Matches, MaxLength, Validate, ValidateIf} from 'class-validator';
import {DateConverter} from 'common/utils/dateConverter';
import {addDaysToDate} from 'common/utils/dateUtils';
import {toNumberOrUndefined} from 'common/utils/numberConverter';
import {LiftBreathingSpaceEndDateValidator} from 'form/validators/liftBreathingSpaceEndDateValidator';
import {ALLOWED_CHARACTER_LIST_FOR_SECURITY, FREE_TEXT_1000_MAX_LENGTH} from 'form/validators/validationConstraints';

export const STANDARD_BREATHING_SPACE = 'STANDARD';
export const STANDARD_BREATHING_SPACE_MAX_DURATION_DAYS = 60;

export const getDefaultStandardLiftEndDate = (startDate: Date): Date => {
  const endDate = addDaysToDate(startDate, STANDARD_BREATHING_SPACE_MAX_DURATION_DAYS);
  endDate.setHours(0, 0, 0, 0);
  return endDate;
};

export class LiftBreathingSpaceForm {

  startDate: Date;
  breathingSpaceType?: string;

  @ValidateIf(o => o.breathingSpaceType === STANDARD_BREATHING_SPACE || !o.breathingSpaceType || !!(o.month || o.year))
  @IsDefined({message: 'ERRORS.VALID_LIFT_END_DATE_DAY'})
    day?: number;

  @ValidateIf(o => o.breathingSpaceType === STANDARD_BREATHING_SPACE || !o.breathingSpaceType || !!(o.day || o.year))
  @IsDefined({message: 'ERRORS.VALID_LIFT_END_DATE_MONTH'})
    month?: number;

  @ValidateIf(o => o.breathingSpaceType === STANDARD_BREATHING_SPACE || !o.breathingSpaceType || !!(o.day || o.month))
  @IsDefined({message: 'ERRORS.VALID_LIFT_END_DATE_YEAR'})
    year?: number;

  @ValidateIf(o => !!(o.day && o.month && o.year))
  @IsDate({message: 'ERRORS.VALID_LIFT_END_DATE_REAL'})
  @Validate(LiftBreathingSpaceEndDateValidator)
    date?: Date;

  @MaxLength(FREE_TEXT_1000_MAX_LENGTH, {message: 'ERRORS.BREATHING_SPACE_LIFT_REASON_MAX_CHARACTERS'})
  @Matches(ALLOWED_CHARACTER_LIST_FOR_SECURITY, {message: 'ERRORS.STANDARD_CHARACTERS_ONLY'})
    text?: string;

  constructor(year?: string, month?: string, day?: string, text?: string, startDate?: Date, breathingSpaceType?: string) {
    this.date = DateConverter.convertToDate(year, month, day);
    this.day = toNumberOrUndefined(day);
    this.month = toNumberOrUndefined(month);
    this.year = toNumberOrUndefined(year);
    this.text = text;
    const normalizedStart = startDate ?? new Date();
    normalizedStart.setHours(0, 0, 0, 0);
    this.startDate = normalizedStart;
    this.breathingSpaceType = breathingSpaceType;
  }
}
