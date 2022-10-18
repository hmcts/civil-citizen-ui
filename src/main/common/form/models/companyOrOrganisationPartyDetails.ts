import {IsDefined, IsNotEmpty, MaxLength, ValidateIf} from 'class-validator';

export class CompanyOrOrganisationPartyDetails {
  contactPerson?: string;

  @ValidateIf(o => o.partyName !== undefined)
  @IsDefined({message: 'ERRORS.VALID_NAME'})
  @IsNotEmpty({message: 'ERRORS.VALID_NAME'})
  @MaxLength(255, {message: 'ERRORS.TEXT_TOO_MANY'})
    partyName?: string;

  constructor(partyName?: string, contactPerson?: string) {
    this.partyName = partyName;
    this.contactPerson = contactPerson;
  }
}
