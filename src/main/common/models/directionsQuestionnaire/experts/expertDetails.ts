import {IsEmail, IsNotEmpty, IsNumber, Min, Validate, ValidateIf} from 'class-validator';
import {PhoneUKValidator} from 'form/validators/phoneUKValidator';

export class ExpertDetails {
  @IsNotEmpty({message: 'ERRORS.ENTER_FIRST_NAME'})
    firstName: string;

  @IsNotEmpty({message: 'ERRORS.ENTER_LAST_NAME'})
    lastName: string;

  @ValidateIf(o => o.emailAddress)
  @IsEmail({allow_display_name: true}, {message: 'ERRORS.ENTER_VALID_EMAIL'})
    emailAddress?: string;

  @ValidateIf(o => o.phoneNumber)
  @Validate(PhoneUKValidator, {message: 'ERRORS.VALID_PHONE_NUMBER'})
    phoneNumber?: number;

  @IsNotEmpty({message: 'ERRORS.ENTER_WHY_NEED_EXPERT'})
    whyNeedExpert: string;

  @IsNotEmpty({message: 'ERRORS.ENTER_EXPERT_FIELD'})
    fieldOfExpertise: string;

  @ValidateIf(o => o.estimatedCost)
  @IsNumber({maxDecimalPlaces: 2}, {message: 'ERRORS.AMOUNT_INVALID_DECIMALS'})
  @Min(0, {message: 'ERRORS.VALID_AMOUNT'})
    estimatedCost?: number;

  constructor(firstName?: string, lastName?: string, emailAddress?: string, phoneNumber?: number, whyNeedExpert?: string, fieldOfExpertise?: string, estimatedCost?: number) {
    this.firstName = firstName?.trim();
    this.lastName = lastName?.trim();
    this.emailAddress = emailAddress;
    this.phoneNumber = phoneNumber;
    this.whyNeedExpert = whyNeedExpert;
    this.fieldOfExpertise = fieldOfExpertise;
    this.estimatedCost = estimatedCost;
  }
}
