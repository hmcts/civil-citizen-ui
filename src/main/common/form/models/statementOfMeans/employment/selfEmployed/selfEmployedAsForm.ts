import { IsNotEmpty, IsNumber, Min, Max, IsDefined } from 'class-validator';
import { MAX_AMOUNT_VALUE } from '../../../../validators/validationConstraints';

export class SelfEmployedAsForm {
  @IsNotEmpty({message: 'ERRORS.JOB_TITLE_REQUIRED'})
    jobTitle?: string;

  @IsDefined({ message: 'ERRORS.ANNUAL_TURNOVER_REQUIRED' })
  @IsNumber({maxDecimalPlaces: 2}, {message: 'ERRORS.VALID_TWO_DECIMAL_NUMBER'})
  @Min(0, { message: 'ERRORS.VALID_POSITIVE_NUMBER' })
  @Max(MAX_AMOUNT_VALUE, {message: 'ERRORS.ANNUAL_TURNOVER_REQUIRED'})
    annualTurnover?: number;

  constructor(jobTitle?: string, annualTurnover?: number) {
    this.jobTitle = jobTitle;
    this.annualTurnover = annualTurnover;
  }

  getAnnualTurnoverAsString(): string {
    return this.annualTurnover === undefined ? '' : String(this.annualTurnover);
  }
}
