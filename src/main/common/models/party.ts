import {IsNotEmpty, ValidateIf} from 'class-validator';
import {PartyType} from 'models/partyType';
import {PartyDetails} from 'common/form/models/partyDetails';

export class Party {
  individualTitle?: string;
  individualLastName?: string;
  individualFirstName?: string;
  soleTraderTradingAs?: string;
  @ValidateIf(o => o.partyName !== undefined)
  @IsNotEmpty({message: 'ERRORS.VALID_PARTY_NAME'})
    partyName?: string;
  type?: PartyType;
  postToThisAddress?: string;
  provideCorrespondenceAddress?: string;
  responseType?: string;
  contactPerson?: string;
  partyDetails?: PartyDetails;

  constructor(value?: Party) {
    this.partyName = value?.partyName;
    this.contactPerson = value?.contactPerson;
    this.postToThisAddress = value?.postToThisAddress;
    this.individualTitle = value?.individualTitle;
    this.individualLastName = value?.individualLastName;
    this.individualFirstName = value?.individualFirstName;
    this.soleTraderTradingAs = value?.soleTraderTradingAs;
    this.partyDetails = value?.partyDetails;
  }
}
