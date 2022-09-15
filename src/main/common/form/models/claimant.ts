import {IsNotEmpty} from 'class-validator';
import {
  VALID_CORRESPONDENCE_ADDRESS_LINE_1,
  VALID_CORRESPONDENCE_CITY,
  VALID_CORRESPONDENCE_POSTCODE,
} from '../validationErrors/errorMessageConstants';

export class Claimant {
  @IsNotEmpty({message: VALID_CORRESPONDENCE_ADDRESS_LINE_1})
    individualTitle?: string;
  @IsNotEmpty({message: VALID_CORRESPONDENCE_POSTCODE})
    individualFirstName: string;
  @IsNotEmpty({message: VALID_CORRESPONDENCE_CITY})
    individualLastName: string;

  constructor(
    individualTitle?: string,
    individualFirstName?: string,
    individualLastName?: string,

    {
    this.correspondenceAddressLine1 = correspondenceAddressLine1;
    this.correspondenceAddressLine2 = correspondenceAddressLine2;
    this.correspondenceAddressLine3 = correspondenceAddressLine3;
    this.correspondenceCity = correspondenceCity;
    this.correspondencePostCode = correspondencePostCode;
  }

  isEmpty() {
    return Object.values(this).every(value => value === undefined || value === '' );
  }
}
