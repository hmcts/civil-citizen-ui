import {IsNotEmpty} from 'class-validator';

export class OtherWitnessItems {
  firstName?: string;

  lastName?: string;

  email?: string;

  telephone?: string;

  @IsNotEmpty({message: 'ERRORS.DEFENDANT_WITNESS_WHAT_THEY_WITNESSED'})
    details?: string;

  constructor(witnessParams?: OtherWitnessItems) {
    this.firstName = trimIfString(witnessParams?.firstName);
    this.lastName = trimIfString(witnessParams?.lastName);
    this.email = witnessParams?.email;
    this.telephone = witnessParams?.telephone;
    this.details = witnessParams?.details;
  }
}

const trimIfString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value.trim() : undefined;
