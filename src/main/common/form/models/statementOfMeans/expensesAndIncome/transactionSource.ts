import {IsDefined, IsNotEmpty, IsNumber, Max, Min, ValidateIf} from 'class-validator';
import {TransactionSchedule} from './transactionSchedule';
import {ExpenseType} from './expenseType';
import {MAX_AMOUNT_VALUE} from '../../../validators/validationConstraints';
import {ScheduledAmount} from '../../../../utils/calculateMonthlyIncomeExpenses/monthlyIncomeExpensesCalculator';
import {IncomeType} from './incomeType';

export interface TransactionSourceParams {
  name?: string;
  amount?: number;
  schedule?: TransactionSchedule;
  isIncome?: boolean;
  nameRequired?: boolean;
}

export class ValidationErrors {
  static readonly NAME_REQUIRED = (_name: string, isIncome: boolean) => {
    if (isIncome) {
      return 'Enter other income source';
    }
    return 'Enter other expense source';
  };
  static readonly AMOUNT_REQUIRED = (name: string, isIncome: boolean) => {
    if (isIncome) {
      return `Enter how much ${name ? name : IncomeType.OTHER} you receive`;
    }
    return `Enter how much you pay for ${name ? name : ExpenseType.OTHER}`;
  };
  static readonly AMOUNT_INVALID_DECIMALS = (name: string) => `Enter a valid ${name} amount, maximum two decimal places`;
  static readonly AMOUNT_NON_NEGATIVE_NUMBER_REQUIRED = (name: string) => `Enter a valid ${name} amount, maximum two decimal places`;
  static readonly SCHEDULE_SELECT_AN_OPTION = (name: string, isIncome: boolean) => {
    if (isIncome) {
      return `Select how often you receive ${name ? name : IncomeType.OTHER}`;
    }
    return `Select how often you pay for ${name ? name : ExpenseType.OTHER}`;
  };

  static withMessage(buildErrorFn: (name?: string, isIncome?: boolean) => string) {
    return (args: any): string => {
      const object: TransactionSource = args.object;
      return buildErrorFn(object.name, object.isIncome);
    };
  }
}

export default class TransactionSource {
  isIncome: boolean;
  nameRequired: boolean;
  @ValidateIf(o => o.nameRequired)
  @IsNotEmpty({message: ValidationErrors.withMessage(ValidationErrors.NAME_REQUIRED)})
    name: string;
  @IsDefined({message: ValidationErrors.withMessage(ValidationErrors.AMOUNT_REQUIRED)})
  @Min(0, {message: ValidationErrors.withMessage(ValidationErrors.AMOUNT_NON_NEGATIVE_NUMBER_REQUIRED)})
  @Max(MAX_AMOUNT_VALUE, {message: ValidationErrors.withMessage(ValidationErrors.AMOUNT_NON_NEGATIVE_NUMBER_REQUIRED)})
  @IsNumber({
    allowNaN: false,
    maxDecimalPlaces: 2,
  }, {message: ValidationErrors.withMessage(ValidationErrors.AMOUNT_NON_NEGATIVE_NUMBER_REQUIRED)})
    amount?: number;
  @IsDefined({message: ValidationErrors.withMessage(ValidationErrors.SCHEDULE_SELECT_AN_OPTION)})
    schedule: TransactionSchedule;

  constructor(params: TransactionSourceParams) {
    this.name = params.name;
    this.amount = params.amount;
    this.schedule = params.schedule;
    this.isIncome = params.isIncome;
    this.nameRequired = params.nameRequired;
  }

  convertToScheduledAmount(): ScheduledAmount {
    return {
      amount: this.amount,
      schedule: this.schedule,
    };
  }
}
