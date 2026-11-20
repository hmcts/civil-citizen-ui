import {IsNotEmpty} from 'class-validator';

export class OtherWitnessItems {
  @IsNotEmpty({message: 'ERRORS.DEFENDANT_WITNESS_ENTER_FIRST_NAME'})
    firstName?: string;

  @IsNotEmpty({message: 'ERRORS.DEFENDANT_WITNESS_ENTER_LAST_NAME'})
    lastName?: string;

  email?: string;

  telephone?: string;

  @IsNotEmpty({message: 'ERRORS.DEFENDANT_WITNESS_WHAT_THEY_WITNESSED'})
    details?: string;

  constructor(witnessParams?: OtherWitnessItems) {
    this.firstName = witnessParams?.firstName?.trim();
    this.lastName = witnessParams?.lastName?.trim();
    this.email = witnessParams?.email;
    this.telephone = witnessParams?.telephone;
    this.details = witnessParams?.details;
  }
}
