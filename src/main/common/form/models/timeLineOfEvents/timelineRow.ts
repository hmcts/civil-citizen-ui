import {IsDefined, IsNotEmpty, MaxLength, ValidateIf} from 'class-validator';
import {
  DATE_REQUIRED,
  DESCRIPTION_REQUIRED,
  VALID_FREE_TEXT_DATE_LENGTH,
  VALID_TEXT_LENGTH,
} from '../../validationErrors/errorMessageConstants';
import {FREE_TEXT_MAX_LENGTH} from '../../validators/validationConstraints';

export default class TimelineRow {
  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsDefined({message: DATE_REQUIRED})
  @IsNotEmpty({message: DATE_REQUIRED})
  @MaxLength(FREE_TEXT_MAX_LENGTH, {message: VALID_FREE_TEXT_DATE_LENGTH})
    date?: string;

  @ValidateIf(o => o.isAtLeastOneFieldPopulated())
  @IsDefined({message: DESCRIPTION_REQUIRED})
  @IsNotEmpty({message: DESCRIPTION_REQUIRED})
  @MaxLength(FREE_TEXT_MAX_LENGTH, {message: VALID_TEXT_LENGTH})
    description?: string;

  constructor(date?: string, description?: string) {
    this.date = date;
    this.description = description;
  }

  public isEmpty(): boolean {
    return Object.values(this).every(value => value === undefined || value === '' || value === []);
  }

  isAtLeastOneFieldPopulated(): boolean {
    return !this.isEmpty();
  }
}
