import { ValidationError, IsNotEmpty, IsNumber, Min, Max, IsDefined } from 'class-validator';
import {Form} from '../../../form';
import {
  JOB_TITLE_REQUIRED,
  ANNUAL_TURNOVER_REQUIRED,
  VALID_TWO_DECIMAL_NUMBER,
  VALID_POSITIVE_NUMBER,
} from '../../../../validationErrors/errorMessageConstants';
import { MAX_AMOUNT_VALUE } from '../../../../validators/validationConstraints';

export class SelfEmployedAsForm extends Form {

  @IsNotEmpty({message: JOB_TITLE_REQUIRED})
    jobTitle?: string;

  @IsDefined({ message: ANNUAL_TURNOVER_REQUIRED })
  @IsNumber({maxDecimalPlaces: 2}, {message: VALID_TWO_DECIMAL_NUMBER})
  @Min(0, { message: VALID_POSITIVE_NUMBER })
  @Max(MAX_AMOUNT_VALUE, {message: ANNUAL_TURNOVER_REQUIRED})
    annualTurnover?: number;

  constructor(jobTitle?: string, annualTurnover?: number, errors?: ValidationError[]) {
    super(errors);
    this.jobTitle = jobTitle;
    this.annualTurnover = annualTurnover;
  }

  getAnnualTurnoverAsString(): string {
    return this.annualTurnover === undefined ? '' : String(this.annualTurnover);
  }
}
