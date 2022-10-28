import {MaxLength, ValidateIf} from 'class-validator';

export class PartyPhone {

  @ValidateIf(o => o.phone !== undefined)
  @MaxLength(20, {message: 'ERRORS.PHONE_TOO_MANY'})
    phone?: string;

  constructor(phone?: string) {
    this.phone = phone;
  }

}
