import {IsDate, MaxLength, Validate, ValidateIf} from 'class-validator';
import {DateConverter} from 'common/utils/dateConverter';
import {addDaysToDate} from 'common/utils/dateUtils';
import {LiftBreathingSpaceEndDateValidator} from 'form/validators/liftBreathingSpaceEndDateValidator';
import {BaseDate} from '../admission/fullAdmission/baseDate';
import { FREE_TEXT_1000_MAX_LENGTH } from 'form/validators/validationConstraints';

export const STANDARD_BREATHING_SPACE = 'STANDARD';
export const STANDARD_BREATHING_SPACE_MAX_DURATION_DAYS = 60;

export const getDefaultStandardLiftEndDate = (startDate: Date): Date => {
  const endDate = addDaysToDate(startDate, STANDARD_BREATHING_SPACE_MAX_DURATION_DAYS);
  endDate.setHours(0, 0, 0, 0);
  return endDate;
};

export class LiftBreathingSpaceForm extends BaseDate {

  startDate: Date;
  breathingSpaceType?: string;

  @ValidateIf(o => !!(o.day && o.month && o.year))
  @IsDate({message: 'ERRORS.VALID_LIFT_END_DATE_REAL'})
  @Validate(LiftBreathingSpaceEndDateValidator)
    date?: Date;

  @MaxLength(FREE_TEXT_1000_MAX_LENGTH, {message: 'ERRORS.BREATHING_SPACE_LIFT_REASON_MAX_CHARACTERS'})
    text?: string;

  constructor(year?: string, month?: string, day?: string, text?: string, startDate?: Date, breathingSpaceType?: string) {
    super(year, month, day);
    this.date = DateConverter.convertToDate(year, month, day);
    this.text = text;
    const normalizedStart = startDate ?? new Date();
    normalizedStart.setHours(0, 0, 0, 0);
    this.startDate = normalizedStart;
    this.breathingSpaceType = breathingSpaceType;
  }
}
