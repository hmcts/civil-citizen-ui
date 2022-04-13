import {IsDefined, IsNumber, Max, Min} from 'class-validator';
import {ScheduledExpenses} from './scheduledExpenses';
import {ExpenseType} from './expenseType';
import {MAX_AMOUNT_VALUE} from '../../../validators/validationConstraints';
import {ScheduledAmount} from '../../../../utils/calculateMonthlyIncomeExpenses/monthlyIncomeExpensesCalculator';

export class ValidationErrors {
  static readonly NAME_REQUIRED = 'Enter other expense source';
  static readonly AMOUNT_REQUIRED = (name: string) => `Enter how much you pay for ${name ? name : ExpenseType.OTHER}`;
  static readonly AMOUNT_INVALID_DECIMALS = (name: string) => `Enter a valid ${name ? name : ExpenseType.OTHER} amount, maximum two decimal places`;
  static readonly AMOUNT_NON_NEGATIVE_NUMBER_REQUIRED = (name: string) => `Enter a valid ${name ? name : ExpenseType.OTHER} amount, maximum two decimal places`;
  static readonly SCHEDULE_SELECT_AN_OPTION = (name: string) => `Select how often you pay for ${name ? name : ExpenseType.OTHER}`;

  static withMessage(buildErrorFn: (name: string) => string) {
    return (args: any): string => {
      const object: ExpenseSource = args.object;
      return buildErrorFn(object.name);
    };
  }
}

export default class ExpenseSource {
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
    schedule: ScheduledExpenses;

  constructor(name?: string, amount?: number, schedule?: ScheduledExpenses) {
    this.name = name;
    this.amount = amount;
    this.schedule = schedule;
  }

  convertToScheduledAmount(): ScheduledAmount {
    return {
      amount: this.amount,
      schedule: this.schedule,
    };
  }
}
