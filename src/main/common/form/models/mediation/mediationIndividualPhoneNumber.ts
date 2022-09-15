import {OptionalIntegerValidator} from '../../validators/optionalIntegerValidator';
import {Validate, IsDefined, ValidateIf, IsNotEmpty, MaxLength} from 'class-validator';
import {YesNo} from '../yesNo';

export class MediationIndividualPhoneNumber {

  @IsDefined({message: 'ERRORS.VALID_YES_NO_OPTION'})
    option?: YesNo;

  @ValidateIf(o => (o.option === YesNo.NO))
  @IsNotEmpty({ message: 'ERRORS.PHONE_NUMBER_REQUIRED' })
  @MaxLength(30, { message: 'ERRORS.VALID_TEXT_LENGTH' })
  @Validate(OptionalIntegerValidator, {message: 'ERRORS.PHONE_NUMBER_REQUIRED'})
    mediationPhoneNumber?: string;

  constructor(option?: YesNo, mediationPhoneNumber?: string) {
    this.option = option;
    this.mediationPhoneNumber = mediationPhoneNumber?.trim();
  }
}
