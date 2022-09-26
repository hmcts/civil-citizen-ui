import {IsEmail, IsNotEmpty, IsNumber, Min, Validate, ValidateIf} from 'class-validator';
import {OptionalIntegerValidator} from '../../../form/validators/optionalIntegerValidator';

export class ExpertDetails {

  firstName?: string;
  lastName?: string;

  @ValidateIf(o => o.emailAddress)
  @IsEmail({IsEmailOption: 'allow_display_name'}, {message: 'ERRORS.ENTER_VALID_EMAIL'})
    emailAddress?: string;

  @ValidateIf(o => o.phoneNumber)
  @Validate(OptionalIntegerValidator, {message: 'ERRORS.VALID_PHONE_NUMBER'})
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
    this.firstName = firstName;
    this.lastName = lastName;
    this.emailAddress = emailAddress;
    this.phoneNumber = phoneNumber;
    this.whyNeedExpert = whyNeedExpert;
    this.fieldOfExpertise = fieldOfExpertise;
    this.estimatedCost = estimatedCost;
  }

  public isEmpty(): boolean {
    return Object.values(this).every(value => value === undefined || value === 0 || value === '' || value?.length === 0);
  }
}
