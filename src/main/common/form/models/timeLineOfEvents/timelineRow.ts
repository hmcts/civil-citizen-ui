import {IsDefined, IsNotEmpty, MaxLength, ValidateIf} from 'class-validator';
import {FREE_TEXT_MAX_LENGTH} from '../../validators/validationConstraints';

export default class TimelineRow {
  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsDefined({message: 'ERRORS.DATE_REQUIRED'})
  @IsNotEmpty({message: 'ERRORS.DATE_REQUIRED'})
  @MaxLength(FREE_TEXT_MAX_LENGTH, {message: 'ERRORS.VALID_FREE_TEXT_DATE_LENGTH'})
    date?: string;

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsDefined({message: 'ERRORS.DESCRIPTION_REQUIRED'})
  @IsNotEmpty({message: 'ERRORS.DESCRIPTION_REQUIRED'})
  @MaxLength(FREE_TEXT_MAX_LENGTH, {message: 'ERRORS.VALID_TEXT_LENGTH'})
    description?: string;

  constructor(date?: string, description?: string) {
    this.date = date;
    this.description = description;
  }

  public static buildPopulatedForm(date: string, description: string): TimelineRow {
    return new TimelineRow(date, description);
  }

  public isEmpty(): boolean {
    return Object.values(this).every(value => value === undefined || value === '' || value === []);
  }

  isAtLeastOneFieldPopulated(): boolean {
    return !this.isEmpty();
  }
}
