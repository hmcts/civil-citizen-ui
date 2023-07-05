import {toCCDDebtDetails} from 'services/translation/response/convertToCCDDebtDetails';
import {PriorityDebts} from 'form/models/statementOfMeans/priorityDebts';
import {Transaction} from 'form/models/statementOfMeans/expensesAndIncome/transaction';
import {CCDDebtDetails, CCDDebtDetailsList, CCDDebtType} from 'models/ccdResponse/ccdDebtDetails';
import {
  TransactionSource,
  TransactionSourceParams,
} from 'form/models/statementOfMeans/expensesAndIncome/transactionSource';
import {TransactionSchedule} from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {CCDPaymentFrequency} from 'models/ccdResponse/ccdPaymentFrequency';

describe('translate priority debts to CCD model', () => {
  it('should return undefined if it is undefined', () => {
    //Given
    //When
    const output = toCCDDebtDetails(undefined);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return undefined if it is empty', () => {
    //Given
    const input = new PriorityDebts();
    //When
    const output = toCCDDebtDetails(input);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return empty if not declared', () => {
    //Given
    const input = setUpTransaction(false, undefined);
    //When
    const output = toCCDDebtDetails(input);
    //Then
    expect(output).toEqual(undefined);
  });

  it('should return empty if declared undefined', () => {
    //Given
    const input = setUpTransaction(undefined, undefined);
    //When
    const output = toCCDDebtDetails(input);
    //Then
    expect(output).toEqual(undefined);
  });

  it('should return value if there is input', () => {
    //Given
    const transactionSourceParams : TransactionSourceParams = {
      isIncome: false,
      nameRequired: true,
      name: 'test',
      amount: Number(1),
      schedule: TransactionSchedule.WEEK,
    };
    const transactionSource = new TransactionSource(transactionSourceParams);
    const input =  setUpTransaction(true, transactionSource);
    const expected : CCDDebtDetails = {
      debtDetails: [
        setUpDebtDetailsItem(CCDDebtType.MORTGAGE, CCDPaymentFrequency.ONCE_ONE_WEEK),
        setUpDebtDetailsItem(CCDDebtType.RENT, CCDPaymentFrequency.ONCE_ONE_WEEK),
        setUpDebtDetailsItem(CCDDebtType.COUNCIL_TAX, CCDPaymentFrequency.ONCE_ONE_WEEK),
        setUpDebtDetailsItem(CCDDebtType.GAS, CCDPaymentFrequency.ONCE_ONE_WEEK),
        setUpDebtDetailsItem(CCDDebtType.ELECTRICITY, CCDPaymentFrequency.ONCE_ONE_WEEK),
        setUpDebtDetailsItem(CCDDebtType.WATER, CCDPaymentFrequency.ONCE_ONE_WEEK),
        setUpDebtDetailsItem(CCDDebtType.MAINTENANCE_PAYMENTS, CCDPaymentFrequency.ONCE_ONE_WEEK),
      ],
    };
    //When
    const output = toCCDDebtDetails(input);
    //Then
    expect(output).toEqual(expected);
  });

  it('should return value if there is input undefined', () => {
    //Given
    const transactionSourceParams : TransactionSourceParams = {
      isIncome: false,
      nameRequired: true,
      name: undefined,
      amount: undefined,
      schedule: undefined,
    };
    const transactionSource = new TransactionSource(transactionSourceParams);
    const input =  setUpTransaction(true, transactionSource);
    const expected : CCDDebtDetails = {
      debtDetails: [
        setUpDebtDetailsUndefinedItem(CCDDebtType.MORTGAGE),
        setUpDebtDetailsUndefinedItem(CCDDebtType.RENT),
        setUpDebtDetailsUndefinedItem(CCDDebtType.COUNCIL_TAX),
        setUpDebtDetailsUndefinedItem(CCDDebtType.GAS),
        setUpDebtDetailsUndefinedItem(CCDDebtType.ELECTRICITY),
        setUpDebtDetailsUndefinedItem(CCDDebtType.WATER),
        setUpDebtDetailsUndefinedItem(CCDDebtType.MAINTENANCE_PAYMENTS),
      ],
    };
    //When
    const output = toCCDDebtDetails(input);
    //Then
    expect(output).toEqual(expected);
  });

  it('should return value if there is input item undefined', () => {
    //Given
    const input =  setUpTransactionUndefined();
    //When
    const output = toCCDDebtDetails(input);
    //Then
    expect(output).toEqual(undefined);
  });
});

const setUpDebtDetailsItem = (debtType: CCDDebtType, frequency: CCDPaymentFrequency): CCDDebtDetailsList => {
  const ccdDebtDetails: CCDDebtDetailsList = {
    value: {
      debtType: debtType,
      paymentAmount: Number('100'),
      paymentFrequency: frequency,
    },
  };
  return ccdDebtDetails;
};

const setUpDebtDetailsUndefinedItem = (debtType: CCDDebtType): CCDDebtDetailsList => {
  const ccdDebtDetails: CCDDebtDetailsList = {
    value: {
      debtType: debtType,
      paymentAmount: undefined,
      paymentFrequency: undefined,
    },
  };
  return ccdDebtDetails;
};

const setUpTransaction = (declare: boolean, transactionSource: TransactionSource): PriorityDebts => {
  const priorityDebts = new PriorityDebts();
  const transaction = new Transaction(declare, transactionSource);
  priorityDebts.mortgage = transaction;
  priorityDebts.rent = transaction;
  priorityDebts.councilTax = transaction;
  priorityDebts.gas = transaction;
  priorityDebts.electricity = transaction;
  priorityDebts.water = transaction;
  priorityDebts.maintenance = transaction;
  return priorityDebts;
};

const setUpTransactionUndefined = (): PriorityDebts => {
  const priorityDebts = new PriorityDebts();
  priorityDebts.mortgage = undefined;
  priorityDebts.rent = undefined;
  priorityDebts.councilTax = undefined;
  priorityDebts.gas = undefined;
  priorityDebts.electricity = undefined;
  priorityDebts.water = undefined;
  priorityDebts.maintenance = undefined;
  return priorityDebts;
};
