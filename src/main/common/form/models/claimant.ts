import {IsNotEmpty} from 'class-validator';
import {
  VALID_FIRST_NAME,
  VALID_LAST_NAME,
} from '../validationErrors/errorMessageConstants';

export class Claimant {
  individualTitle?: string;
  @IsNotEmpty({message: VALID_FIRST_NAME})
    individualFirstName: string;
  @IsNotEmpty({message: VALID_LAST_NAME})
    individualLastName: string;

  constructor(
    individualTitle?: string,
    individualFirstName?: string,
    individualLastName?: string,
  ){
    this.individualTitle = individualTitle;
    this.individualFirstName = individualFirstName;
    this.individualLastName = individualLastName;
  }

  isEmpty() {
    return Object.values(this).every(value => value === undefined || value === '' );
  }
}
