import {IsDefined, IsNotEmpty, IsNumber, Max, Min, ValidateIf} from 'class-validator';
import {TransactionSchedule} from './transactionSchedule';
import {MAX_AMOUNT_VALUE} from '../../../validators/validationConstraints';
import {ScheduledAmount} from '../../../../utils/calculateMonthlyIncomeExpenses/monthlyIncomeExpensesCalculator';
import {ExpenseType} from './expenseType';
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
      return 'ERRORS.TRANSACTION_SOURCE.ENTER_OTHER_INCOME';
    }
    return 'Enter other expense source';
  };
  static readonly AMOUNT_REQUIRED = (sourceName: string, isIncome: boolean) => {
    const HOW_MUCH_INCOME_KEY = 'ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.';
    if (isIncome) {
      return HOW_MUCH_INCOME_KEY.concat(ValidationErrors.getTransalationKey(sourceName));
    }
    return `Enter how much you pay for ${sourceName ? sourceName : ExpenseType.OTHER}`;
  };
  static readonly AMOUNT_INVALID_DECIMALS = (name: string) => `Enter a valid ${name} amount, maximum two decimal places`;
  static readonly AMOUNT_NON_NEGATIVE_NUMBER_REQUIRED = (sourceName: string, isIncome: boolean) => {
    const VALID_NUMBER_AMOUNT_KEY = 'ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.';
    if (isIncome) {
      return VALID_NUMBER_AMOUNT_KEY.concat(ValidationErrors.getTransalationKey(sourceName));
    }
    return `Enter a valid ${sourceName} amount, maximum two decimal places`;

  };
  static readonly SCHEDULE_SELECT_AN_OPTION = (sourceName: string, isIncome: boolean) => {
    const HOW_OFTEN_RECEIVE_KEY = 'ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.';
    if (isIncome) {
      return HOW_OFTEN_RECEIVE_KEY.concat(ValidationErrors.getTransalationKey(sourceName));
    }
    return `Select how often you pay for ${sourceName ? sourceName : ExpenseType.OTHER}`;
  };

  private static getTransalationKey(sourceName?: string): string{
    switch (sourceName) {
      case IncomeType.JOB:
        return 'INCOME_JOB';
      case IncomeType.UNIVERSAL_CREDIT:
        return 'UNIVERSAL_CREDIT';
      case IncomeType.JOB_SEEKERS_ALLOWANCE_INCOME_BASED:
        return 'JOBSEEKER_INCOME';
      case IncomeType.JOB_SEEKERS_ALLOWANCE_CONTRIBUTION_BASED:
        return 'JOBSEEKER_CONTRIBUTION';
      case IncomeType.INCOME_SUPPORT:
        return 'INCOME_SUPPORT';
      case IncomeType.WORKING_TAX_CREDIT:
        return 'WORKING_TAX';
      case IncomeType.CHILD_TAX_CREDIT:
        return 'CHILD_TAX';
      case IncomeType.CHILD_BENEFIT:
        return 'CHILD_BENEFIT';
      case IncomeType.COUNCIL_TAX_SUPPORT:
        return 'COUNCIL_TAX';
      case IncomeType.PENSION:
        return 'PENSION';
      default:
        return 'OTHER';
    }
  }

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
