import {YesNoUpperCamelCase} from 'form/models/yesNo';

export interface CCDWitnessDetails {
  name?: string,
  firstName?: string,
  lastName?: string,
  emailAddress?: string,
  phoneNumber?: string,
  reasonForWitness?: string,
}

export interface CCDWitnesses {
  witnessesToAppear?: YesNoUpperCamelCase,
  details?: CCDWitnessDetails[];
}
