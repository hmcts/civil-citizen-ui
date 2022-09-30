import {OptionalIntegerValidator} from '../../validators/optionalIntegerValidator';
import {Validate} from 'class-validator';

export class ClaimantPhoneNumber{
  @Validate(OptionalIntegerValidator, {message: 'ERRORS.VALID_PHONE_NUMBER'})
    phoneNumber?: string;

  constructor(phoneNumber?: string) {
    this.phoneNumber = phoneNumber?.trim();
  }
}
