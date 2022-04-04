import { Max, Min, ValidationError, IsNotEmpty, Validate } from 'class-validator'; // Max,
import {Form} from '../../../../../form';
import {MAX_AMOUNT_VALUE, MIN_AMOUNT_VALUE} from '../../../../../validators/validationConstraints'; // MAX_AMOUNT_VALUE
import { AnnualAmountValidator } from '../../../../../validators/annualAmountValidator';
//import { AccountBalanceValidator } from '../../../validators/accountBalanceValidator';
import {
  JOB_TITLE_REQUIRED,
  ANNUAL_TURNOVER_REQUIRED,
} from '../../../../../validationErrors/errorMessageConstants';

export class SelfEmployedAs extends Form {

  @IsNotEmpty({message: JOB_TITLE_REQUIRED})
    jobTitle?: string;

  @IsNotEmpty({message: ANNUAL_TURNOVER_REQUIRED})
  @Min(MIN_AMOUNT_VALUE, { message: ANNUAL_TURNOVER_REQUIRED })
  @Max(MAX_AMOUNT_VALUE, { message: ANNUAL_TURNOVER_REQUIRED })
  @Validate(AnnualAmountValidator)
    annualTurnover?: number;

  constructor(jobTitle?: string, annualTurnover?: number, errors?: ValidationError[]) {
    super(errors);
    this.jobTitle = jobTitle;
    this.annualTurnover = Number(annualTurnover);
  }
}
