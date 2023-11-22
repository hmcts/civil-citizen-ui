import {Address} from 'form/models/address';
import {PartyDetails} from "form/models/partyDetails";

// This will be removed after CARM release, existing model
export class PartyDetailsOptional extends PartyDetails {
  contactPerson?: string;

  constructor(value: Record<string, string>) {
    super(value);
    this.individualTitle = value?.individualTitle;
    this.individualLastName = value?.individualLastName;
    this.individualFirstName = value?.individualFirstName;
    this.soleTraderTradingAs = value?.soleTraderTradingAs;
    this.partyName = value?.partyName;
    this.contactPerson = value?.contactPerson;
    this.postToThisAddress = value?.postToThisAddress;
    this.provideCorrespondenceAddress = value?.provideCorrespondenceAddress;
    if(Array.isArray(value?.addressLine1)){
      this.primaryAddress = Address.fromObject(value, 0);
      this.correspondenceAddress = Address.fromObject(value, 1);
    }else{
      this.primaryAddress = new Address(value?.addressLine1, value?.addressLine2, value?.addressLine3, value?.city, value?.postCode);
    }

  }

}
