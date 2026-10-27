import {IsDefined, IsNotEmpty, Validate} from 'class-validator';
import {PhoneUKValidator} from 'form/validators/phoneUKValidator';

export class AlternativeTelephone {
  @IsDefined({ message: 'ERRORS.PHONE_NUMBER_REQUIRED_CARM' })
  @IsNotEmpty({ message: 'ERRORS.PHONE_NUMBER_REQUIRED_CARM' })
  @Validate(PhoneUKValidator, {message: 'ERRORS.VALID_PHONE_NUMBER'})
    alternativeTelephone?: string;

  constructor(alternativeTelephone?: string) {
    this.alternativeTelephone = alternativeTelephone;
  }
}
