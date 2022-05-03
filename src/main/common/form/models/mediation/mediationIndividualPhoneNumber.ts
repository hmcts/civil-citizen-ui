import {OptionalIntegerValidator} from '../../validators/optionalIntegerValidator';
import {Validate, IsDefined, ValidateIf, IsNotEmpty, MaxLength} from 'class-validator';
import {
  PHONE_NUMBER_REQUIRED,
  VALID_YES_NO_OPTION,
  VALID_TEXT_LENGTH,
} from '../../validationErrors/errorMessageConstants';
import {YesNo} from '../yesNo';

export class MediationIndividualPhoneNumber {

  @IsDefined({message: VALID_YES_NO_OPTION})
    option?: YesNo;

  @ValidateIf(o => (o.option === YesNo.NO))
  @IsNotEmpty({ message: PHONE_NUMBER_REQUIRED })
  @MaxLength(30, { message: VALID_TEXT_LENGTH })
  @Validate(OptionalIntegerValidator, {message: PHONE_NUMBER_REQUIRED})
    telephoneNumber?: string;

  constructor(option?: YesNo, telephoneNumber?: string) {
    this.option = option;
    this.telephoneNumber = telephoneNumber?.trim();
  }
}
