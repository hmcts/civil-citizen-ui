import {IsDefined} from 'class-validator';

export class PinType {

  @IsDefined({ message: 'ERRORS.ENTER_VALID_SECURITY_CODE' })
    pin?: string;

  constructor(pin?: string) {
    this.pin = pin;
  }
}
