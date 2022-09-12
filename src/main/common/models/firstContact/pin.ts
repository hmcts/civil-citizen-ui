import {IsNotEmpty} from 'class-validator';

export class PinType {

  @IsNotEmpty({ message: 'ERRORS.ENTER_VALID_SECURITY_CODE' })
    pin?: string;

  constructor(pin?: string) {
    this.pin = pin;
  }
}
