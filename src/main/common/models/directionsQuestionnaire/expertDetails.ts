import {
  IsDefined,
  IsEmail,
  IsNumber,
  Validate
} from "class-validator";
import {OptionalIntegerValidator} from "../../../common/form/validators/optionalIntegerValidator";

export class ExpertDetails {
  firstName?: string;
  lastName?: string;

  @IsEmail({ message: 'ERRORS.ENTER_VALID_EMAIL' })
  emailAddress?: string;

  @Validate(OptionalIntegerValidator, { message: 'ERRORS.VALID_PHONE_NUMBER' })
  phoneNumber?: number;

  @IsDefined({ message: 'ERRORS.ENTER_WHY_NEED_EXPERT' })
  whyNeedExpert?: string;

  @IsDefined({ message: 'ERRORS.ENTER_EXPERT_FIELD' })
  fieldOfExpertise?: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'ERRORS.AMOUNT_INVALID_DECIMALS' })
  estimatedCost?: number;

}
