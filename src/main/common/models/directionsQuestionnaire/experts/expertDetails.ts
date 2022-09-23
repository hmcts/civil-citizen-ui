import {
  IsNotEmpty,
  IsEmail,
  IsNumber,
  Validate,
  IsEmpty,
} from "class-validator";
import {OptionalIntegerValidator} from "../../../form/validators/optionalIntegerValidator";

export class ExpertDetails {
  
  firstName?: string;
  lastName?: string;

  @IsEmail({ message: 'ERRORS.ENTER_VALID_EMAIL' })
  emailAddress?: string;

  @Validate(OptionalIntegerValidator, { message: 'ERRORS.VALID_PHONE_NUMBER' })
  phoneNumber?: number;
  
  @IsNotEmpty({ message: 'ERRORS.ENTER_WHY_NEED_EXPERT' })
  @IsEmpty({ message: 'ERRORRRRRRR IS EMPTY' })
  whyNeedExpert: string;

  @IsNotEmpty({ message: 'ERRORS.ENTER_EXPERT_FIELD' })
  @IsEmpty({ message: 'ERRORRRRRRR IS EMPTY' })
  fieldOfExpertise: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'ERRORS.AMOUNT_INVALID_DECIMALS' })
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
}
