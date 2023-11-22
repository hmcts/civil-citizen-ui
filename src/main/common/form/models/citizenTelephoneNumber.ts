import {Validate} from 'class-validator';
import {PhoneUKValidator} from '../validators/phoneUKValidator';
import {IsNotEmpty} from "form/validators/mandatoryValidatorCarm";

export class CitizenTelephoneNumber {
  carmEnabled?: boolean;
  @Validate(PhoneUKValidator, {message: 'ERRORS.VALID_PHONE_NUMBER'})
  @Validate(IsNotEmpty, ['carmEnabled', (o: CitizenTelephoneNumber) => o.carmEnabled], {message: 'ERRORS.ENTER_TELEPHONE_NUMBER'})
    telephoneNumber?: string;
  ccdPhoneExist?: boolean;

  constructor(telephoneNumber?: string,  ccdPhoneExist?: boolean, carmEnabled?: boolean) {
    this.telephoneNumber = telephoneNumber?.trim();
    this.ccdPhoneExist = ccdPhoneExist;
    this.carmEnabled = carmEnabled;
  }
}
