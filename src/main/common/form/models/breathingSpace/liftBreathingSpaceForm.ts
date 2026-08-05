import {IsDate, Validate, ValidateIf} from 'class-validator';
import {DateConverter} from 'common/utils/dateConverter';
import {addDaysToDate} from 'common/utils/dateUtils';
import {LiftBreathingSpaceEndDateValidator} from 'form/validators/liftBreathingSpaceEndDateValidator';
import {BaseDate} from '../admission/fullAdmission/baseDate';

export const STANDARD_BREATHING_SPACE = 'STANDARD';
export const STANDARD_BREATHING_SPACE_MAX_DURATION_DAYS = 60;

export const getDefaultStandardLiftEndDate = (startDate: Date): Date => {
  const endDate = addDaysToDate(startDate, STANDARD_BREATHING_SPACE_MAX_DURATION_DAYS);
  endDate.setHours(0, 0, 0, 0);
  return endDate;
};

export const getDefaultNonStandardLiftEndDate = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export class LiftBreathingSpaceForm extends BaseDate {

  /** Set from claim.enterBreathing.start when building the lift breathing space form. */
  startDate: Date;
  breathingSpaceType?: string;

  @ValidateIf(o => !!(o.day && o.month && o.year))
  @IsDate({message: 'ERRORS.VALID_LIFT_END_DATE_REAL'})
  @Validate(LiftBreathingSpaceEndDateValidator)
    date?: Date;

  text?: string;

  constructor(year?: string, month?: string, day?: string, text?: string, startDate?: Date, breathingSpaceType?: string) {
    super(year, month, day);
    this.date = DateConverter.convertToDate(year, month, day);
    this.text = text;
    const normalizedStart = startDate ?? new Date();
    normalizedStart.setHours(0, 0, 0, 0);
    this.startDate = normalizedStart;
    this.breathingSpaceType = breathingSpaceType;

    if (!year && !month && !day && breathingSpaceType && breathingSpaceType !== STANDARD_BREATHING_SPACE) {
      const endDate = getDefaultNonStandardLiftEndDate();
      this.date = endDate;
      this.day = endDate.getDate();
      this.month = endDate.getMonth() + 1;
      this.year = endDate.getFullYear();
    }
  }
}
