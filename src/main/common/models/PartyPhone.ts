import {IsNotEmpty, MaxLength, Validate, ValidateIf} from 'class-validator';
import {PhoneUKValidator} from 'common/form/validators/phoneUKValidator';

export class PartyPhone {
  @ValidateIf(o => o.phone !== undefined)
  @MaxLength(20, {message: 'ERRORS.PHONE_TOO_MANY'})
  @IsNotEmpty({message: 'ERRORS.NOT_TO_REMOVE_PHONE_NUMBER'})
  @Validate(PhoneUKValidator, ['originalResponseDeadline', 28], {message: 'ERRORS.DATE_NOT_MORE_THAN_28_DAYS'})
    phone?: string;

  constructor(phone?: string) {
    this.phone = phone;
  }

}
