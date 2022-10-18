import {IsDefined, IsNotEmpty, IsNumber, Max, Min} from 'class-validator';
import {MAX_AMOUNT_VALUE, MIN_AMOUNT_VALUE} from '../../validators/validationConstraints';

export type ScheduleOptions = 'WEEK' | 'TWO_WEEKS' | 'FOUR_WEEKS' | 'MONTH';

export interface DebtValidationError {
  text: string;
  href: string;
}

export interface DebtDetailsError {
  amount?: DebtValidationError;
  schedule?: DebtValidationError;
}

const getLastElement = (translationKey: string): string => translationKey.split('.').pop();

const generateErrorMessageForValidTwoDecimalNumber = (name: string): string =>
  `ERRORS.VALID_DEBT_AMOUNT.${getLastElement(name)}`;

const generateErrorMessageForValidPaymentAmount = (name: string): string =>
  `ERRORS.SELECT_AMOUNT.${getLastElement(name)}`;

const generateErrorMessageForValidPaymentSchedule = (name: string) =>
  `ERRORS.SELECT_FREQUENCY.${getLastElement(name)}`;

const withMessage = (buildErrorFn: (name: string) => string) => {
  return (args: any): string => {
    const object: PriorityDebtDetails = args.object;
    return buildErrorFn(object.name);
  };
};

export class PriorityDebtDetails {
  name?: string;
  isDeclared?: boolean;

  @IsDefined({
    message: withMessage(generateErrorMessageForValidPaymentAmount),
  })
  @Min(MIN_AMOUNT_VALUE, {
    message: withMessage(generateErrorMessageForValidTwoDecimalNumber),
  })
  @Max(MAX_AMOUNT_VALUE, {
    message: withMessage(generateErrorMessageForValidTwoDecimalNumber),
  })
  @IsNumber(
    {allowNaN: false, maxDecimalPlaces: 2},
    {
      message: withMessage(generateErrorMessageForValidTwoDecimalNumber),
    },
  )
    amount?: number;

  @IsNotEmpty({
    message: withMessage(generateErrorMessageForValidPaymentSchedule),
  })
    schedule?: ScheduleOptions;

  constructor(
    isDeclared?: boolean,
    name?: string,
    amount?: number,
    schedule?: ScheduleOptions,
  ) {
    this.name = name;
    this.isDeclared = isDeclared || false;
    this.amount = amount;
    this.schedule = schedule;
  }

  get populated(): boolean {
    return !!this.amount || !!this.schedule || this.isDeclared;
  }
}
