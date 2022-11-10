import {DebtRespiteOptionType} from './debtRespiteOptionType';
import {IsIn} from 'class-validator';

export class DebtRespiteOption {
  @IsIn(Object.values(DebtRespiteOptionType), {message: 'ERRORS.VALID_DEBT_RESPITE_OPTION'})
    type: DebtRespiteOptionType;

  constructor(type?: DebtRespiteOptionType) {
    this.type = type;
  }
}
