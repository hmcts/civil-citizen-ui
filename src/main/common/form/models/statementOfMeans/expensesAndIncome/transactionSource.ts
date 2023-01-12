import {IsDefined, IsNotEmpty, IsNumber, Max, Min, ValidateIf} from 'class-validator';
import {TransactionSchedule} from './transactionSchedule';
import {MAX_AMOUNT_VALUE} from '../../../validators/validationConstraints';
import {ScheduledAmount} from '../../../../utils/calculateMonthlyIncomeExpenses/monthlyIncomeExpensesCalculator';
import {IncomeType} from './incomeType';
import {ExpenseType} from './expenseType';

export interface TransactionSourceParams {
  name?: string;
  amount?: number;
  schedule?: TransactionSchedule;
  isIncome?: boolean;
  nameRequired?: boolean;
}

export class ValidationErrors {

  static readonly generateErrorMessageForValidPaymentAmount = (name: string): string => {
    return `ERRORS.EXPENSES_AMOUNT.${ValidationErrors.getExpensesTransalationKey(name)}`;
  };

  static readonly generateErrorMessageForValidScheduleFrequency = (name: string): string => {
    return `ERRORS.EXPENSES_FREQUENCY.${ValidationErrors.getExpensesTransalationKey(name)}`;
  };

  static readonly generateErrorMessageForValidPaymentAmountFormat = (name: string): string => {
    return `ERRORS.EXPENSES_AMOUNT_FORMAT.${ValidationErrors.getExpensesTransalationKey(name)}`;
  };

  static readonly NAME_REQUIRED = (_name: string, isIncome: boolean) => {
    if (isIncome) {
      return 'ERRORS.TRANSACTION_SOURCE.ENTER_OTHER_INCOME';
    }
    return 'ERRORS.EXPENSES_ENTER_OTHER_SOURCE';
  };
  static readonly AMOUNT_REQUIRED = (sourceName: string, isIncome: boolean) => {
    const HOW_MUCH_INCOME_KEY = 'ERRORS.TRANSACTION_SOURCE.HOW_MUCH_INCOME.';
    if (isIncome) {
      return HOW_MUCH_INCOME_KEY.concat(ValidationErrors.getTransalationKey(sourceName));
    }

    return ValidationErrors.generateErrorMessageForValidPaymentAmount(sourceName);
  };
  static readonly AMOUNT_NON_NEGATIVE_NUMBER_REQUIRED = (sourceName: string, isIncome: boolean) => {
    const VALID_NUMBER_AMOUNT_KEY = 'ERRORS.TRANSACTION_SOURCE.VALID_NUMBER_AMOUNT.';
    if (isIncome) {
      return VALID_NUMBER_AMOUNT_KEY.concat(ValidationErrors.getTransalationKey(sourceName));
    }
    return ValidationErrors.generateErrorMessageForValidPaymentAmountFormat(sourceName);

  };
  static readonly SCHEDULE_SELECT_AN_OPTION = (sourceName: string, isIncome: boolean) => {
    const HOW_OFTEN_RECEIVE_KEY = 'ERRORS.TRANSACTION_SOURCE.HOW_OFTEN_RECEIVE.';
    if (isIncome) {
      return HOW_OFTEN_RECEIVE_KEY.concat(ValidationErrors.getTransalationKey(sourceName));
    }

    return ValidationErrors.generateErrorMessageForValidScheduleFrequency(sourceName);
  };

  private static getExpensesTransalationKey(sourceName?: string): string {
    switch (sourceName) {
      case ExpenseType.MORTGAGE:
        return 'MORTGAGE';
      case ExpenseType.MORTGAGE_DEBT:
        return 'MORTGAGE_DEBT';
      case ExpenseType.RENT:
        return 'RENT';
      case ExpenseType.RENT_DEBT:
        return 'RENT_DEBT';
      case ExpenseType.COUNCIL_TAX:
        return 'COUNCIL_TAX';
      case ExpenseType.COUNCIL_TAX_OR_COMMUNITY_CHARGE:
        return 'COUNCIL_TAX_OR_COMMUNITY_CHARGE';
      case ExpenseType.GAS:
        return 'GAS';
      case ExpenseType.GAS_DEBT:
        return 'GAS_DEBT';
      case ExpenseType.WATER:
        return 'WATER';
      case ExpenseType.WATER_DEBT:
        return 'WATER_DEBT';
      case ExpenseType.ELECTRICITY:
        return 'ELECTRICITY';
      case ExpenseType.ELECTRICITY_DEBT:
        return 'ELECTRICITY_DEBT';
      case ExpenseType.TRAVEL:
        return 'TRAVEL';
      case ExpenseType.SCHOOL_COSTS:
        return 'SCHOOL_COSTS';
      case ExpenseType.FOOD_HOUSEKEEPING:
        return 'FOOD_HOUSEKEEPING';
      case ExpenseType.TV_AND_BROADBAND:
        return 'TV_AND_BROADBAND';
      case ExpenseType.HIRE_PURCHASES:
        return 'HIRE_PURCHASES';
      case ExpenseType.MOBILE_PHONE:
        return 'MOBILE_PHONE';
      case ExpenseType.MAINTENANCE_PAYMENTS:
        return 'MAINTENANCE_PAYMENTS';
      case ExpenseType.MAINTENANCE_PAYMENTS_DEBT:
        return 'MAINTENANCE_PAYMENTS_DEBT';
      default:
        return 'OTHER';
    }
  }

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

export class TransactionSource {
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
