import {YesNoUpperCamelCase} from 'form/models/yesNo';

export interface CCDWitnesses {
  witnessesToAppear?: YesNoUpperCamelCase,
  details?: CCDWitnessDetails[];
}

export interface CCDWitnessDetails {
  id?: string,
  value?: CCDWitnessItem,
}

interface CCDWitnessItem {
  name?: string,
  firstName?: string,
  lastName?: string,
  emailAddress?: string,
  phoneNumber?: string,
  reasonForWitness?: string,
}

