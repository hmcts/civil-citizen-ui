import {IsDate, ValidateIf} from 'class-validator';
import {DateConverter} from 'common/utils/dateConverter';
import {BaseDate} from '../admission/fullAdmission/baseDate';

export const STANDARD_BREATHING_SPACE = 'STANDARD';

export class LiftBreathingSpaceForm extends BaseDate {

  // TODO: replace with actual startDate from claim.breathingSpace.enterBreathing.start when JIRA for start date is complete
  startDate: Date;
  breathingSpaceType?: string;

  @ValidateIf(o => !!(o.day && o.month && o.year))
  @IsDate({message: 'ERRORS.VALID_LIFT_END_DATE_REAL'})
    date?: Date;

  text?: string;

  constructor(year?: string, month?: string, day?: string, text?: string, startDate?: Date, breathingSpaceType?: string) {
    super(year, month, day);
    this.date = DateConverter.convertToDate(year, month, day);
    this.text = text;
    // TODO: replace with actual startDate from claim.breathingSpace.enterBreathing.start when JIRA for start date is complete
    const today = startDate ?? new Date();
    today.setHours(0, 0, 0, 0);
    this.startDate = today;
    this.breathingSpaceType = breathingSpaceType;
  }
}
