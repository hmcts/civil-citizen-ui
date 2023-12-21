import {IsDefined, IsNotEmpty, MaxLength} from 'class-validator';

export class AlternativeContactPerson {
  @IsDefined({ message: 'ERRORS.VALID_CONTACT_PERSON' })
  @IsNotEmpty({ message: 'ERRORS.VALID_CONTACT_PERSON' })
  @MaxLength(70, { message: 'ERRORS.FULL_NAME_TOO_LONG' })
    alternativeContactPerson?: string;

  constructor(alternativeContactPerson?: string) {
    this.alternativeContactPerson = alternativeContactPerson;
  }
}
