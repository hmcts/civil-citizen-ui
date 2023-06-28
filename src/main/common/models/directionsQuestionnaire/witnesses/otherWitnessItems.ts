import {IsNotEmpty, IsEmail, Validate, ValidateIf} from 'class-validator';
import {PhoneUKValidator} from 'form/validators/phoneUKValidator';

export class OtherWitnessItems {
  @IsNotEmpty({message: 'ERRORS.DEFENDANT_WITNESS_ENTER_FIRST_NAME'})
    firstName?: string;

  @IsNotEmpty({message: 'ERRORS.DEFENDANT_WITNESS_ENTER_LAST_NAME'})
    lastName?: string;

  @ValidateIf(o => o.email)
  @IsEmail({allow_display_name: true}, {message: 'ERRORS.ENTER_VALID_EMAIL'})
    email?: string;

  @ValidateIf(o => o.telephone)
  @Validate(PhoneUKValidator, {message: 'ERRORS.VALID_PHONE_NUMBER'})
    telephone?: string;

  @IsNotEmpty({message: 'ERRORS.DEFENDANT_WITNESS_WHAT_THEY_WITNESSED'})
    details?: string;

  constructor(witnessParams?: OtherWitnessItems) {
    this.firstName = witnessParams.firstName;
    this.lastName = witnessParams.lastName;
    this.email = witnessParams.email;
    this.telephone = witnessParams.telephone;
    this.details = witnessParams.details;
  }
}
