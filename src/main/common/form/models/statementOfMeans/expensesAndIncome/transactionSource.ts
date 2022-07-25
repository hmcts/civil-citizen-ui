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
  static readonly AMOUNT_REQUIRED = (name: string, isIncome: boolean) => {
    if (isIncome) {
      switch (name) {
        case IncomeType.JOB:
          return 'ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.INCOME_JOB';
        case IncomeType.UNIVERSAL_CREDIT:
          return 'ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.UNIVERSAL_CREDIT';
        case IncomeType.JOB_SEEKERS_ALLOWANCE_INCOME_BASED:
          return 'ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.JOBSEEKER_INCOME';
        case IncomeType.JOB_SEEKERS_ALLOWANCE_CONTRIBUTION_BASED:
          return 'ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.JOBSEEKER_CONTRIBUTION';
        case IncomeType.INCOME_SUPPORT:
          return 'ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.INCOME_SUPPORT';
        case IncomeType.WORKING_TAX_CREDIT:
          return 'ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.WORKING_TAX';
        case IncomeType.CHILD_TAX_CREDIT:
          return 'ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.CHILD_TAX';
        case IncomeType.CHILD_BENEFIT:
          return 'ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.CHILD_BENEFIT';
        case IncomeType.COUNCIL_TAX_SUPPORT:
          return 'ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.COUNCIL_TAX';
        case IncomeType.PENSION:
          return 'ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.PENSION';
        default:
          return 'ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.OTHER';
      }
    }
    return `Enter how much you pay for ${name ? name : ExpenseType.OTHER}`;
  };
  static readonly AMOUNT_INVALID_DECIMALS = (name: string) => `Enter a valid ${name} amount, maximum two decimal places`;
  static readonly AMOUNT_NON_NEGATIVE_NUMBER_REQUIRED = (name: string, isIncome: boolean) => {
    if (isIncome) {
      switch (name) {
        case IncomeType.JOB:
          return 'ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.INCOME_JOB';
        case IncomeType.UNIVERSAL_CREDIT:
          return 'ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.UNIVERSAL_CREDIT';
        case IncomeType.JOB_SEEKERS_ALLOWANCE_INCOME_BASED:
          return 'ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.JOBSEEKER_INCOME';
        case IncomeType.JOB_SEEKERS_ALLOWANCE_CONTRIBUTION_BASED:
          return 'ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.JOBSEEKER_CONTRIBUTION';
        case IncomeType.INCOME_SUPPORT:
          return 'ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.INCOME_SUPPORT';
        case IncomeType.WORKING_TAX_CREDIT:
          return 'ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.WORKING_TAX';
        case IncomeType.CHILD_TAX_CREDIT:
          return 'ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.CHILD_TAX';
        case IncomeType.CHILD_BENEFIT:
          return 'ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.CHILD_BENEFIT';
        case IncomeType.COUNCIL_TAX_SUPPORT:
          return 'ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.COUNCIL_TAX';
        case IncomeType.PENSION:
          return 'ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.PENSION';
        default:
          return 'ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.OTHER';
      }
    }
    return `Enter a valid ${name} amount, maximum two decimal places`;

  };
  static readonly SCHEDULE_SELECT_AN_OPTION = (name: string, isIncome: boolean) => {
    if (isIncome) {
      switch (name) {
        case IncomeType.JOB:
          return 'ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.INCOME_JOB';
        case IncomeType.UNIVERSAL_CREDIT:
          return 'ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.UNIVERSAL_CREDIT';
        case IncomeType.JOB_SEEKERS_ALLOWANCE_INCOME_BASED:
          return 'ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.JOBSEEKER_INCOME';
        case IncomeType.JOB_SEEKERS_ALLOWANCE_CONTRIBUTION_BASED:
          return 'ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.JOBSEEKER_CONTRIBUTION';
        case IncomeType.INCOME_SUPPORT:
          return 'ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.INCOME_SUPPORT';
        case IncomeType.WORKING_TAX_CREDIT:
          return 'ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.WORKING_TAX';
        case IncomeType.CHILD_TAX_CREDIT:
          return 'ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.CHILD_TAX';
        case IncomeType.CHILD_BENEFIT:
          return 'ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.CHILD_BENEFIT';
        case IncomeType.COUNCIL_TAX_SUPPORT:
          return 'ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.COUNCIL_TAX';
        case IncomeType.PENSION:
          return 'ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.PENSION';
        default:
          return 'ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.OTHER';
      }
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
