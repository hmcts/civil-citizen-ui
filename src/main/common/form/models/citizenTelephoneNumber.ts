import {Validate} from 'class-validator';
import {PhoneUKValidator} from '../validators/phoneUKValidator';
import {IsNotEmptyForParty} from 'form/validators/mandatoryValidatorForParty';

export class CitizenTelephoneNumber {
  mandatoryForParty?: boolean;
  @Validate(PhoneUKValidator, {message: 'ERRORS.VALID_PHONE_NUMBER'})
  @Validate(IsNotEmptyForParty, ['mandatoryForParty', (o: CitizenTelephoneNumber) => o.mandatoryForParty], {message: 'ERRORS.ENTER_TELEPHONE_NUMBER'})
    telephoneNumber?: string;
  ccdPhoneExist?: boolean;

  constructor(telephoneNumber?: string,  ccdPhoneExist?: boolean, mandatoryForParty?: boolean) {
    this.telephoneNumber = telephoneNumber?.trim();
    this.ccdPhoneExist = ccdPhoneExist;
    this.mandatoryForParty = mandatoryForParty;
  }
}
