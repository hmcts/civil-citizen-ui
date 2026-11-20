import {IsNotEmpty, IsNumber, Min, ValidateIf} from 'class-validator';

export class ExpertDetails {
  @IsNotEmpty({message: 'ERRORS.ENTER_FIRST_NAME'})
    firstName?: string;

  @IsNotEmpty({message: 'ERRORS.ENTER_LAST_NAME'})
    lastName?: string;

  emailAddress?: string;

  phoneNumber?: number;

  @IsNotEmpty({message: 'ERRORS.ENTER_WHY_NEED_EXPERT'})
    whyNeedExpert?: string;

  @IsNotEmpty({message: 'ERRORS.ENTER_EXPERT_FIELD'})
    fieldOfExpertise?: string;

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
