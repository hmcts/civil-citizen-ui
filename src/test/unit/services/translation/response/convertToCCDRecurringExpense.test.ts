import {ResponseType} from 'form/models/responseType';
import {Claim} from 'models/claim';
import {StatementOfMeans} from 'models/statementOfMeans';
import {RegularIncome} from 'form/models/statementOfMeans/expensesAndIncome/regularIncome';
import {
  TransactionSource,
  TransactionSourceParams,
} from 'form/models/statementOfMeans/expensesAndIncome/transactionSource';
import {TransactionSchedule} from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {Transaction} from 'form/models/statementOfMeans/expensesAndIncome/transaction';
import {CCDPaymentFrequency} from 'models/ccdResponse/ccdPaymentFrequency';
import {OtherTransaction} from 'form/models/statementOfMeans/expensesAndIncome/otherTransaction';
import {toCCDRecurringExpensesField} from 'services/translation/response/convertToCCDRecurringExpense';
import {ExpenseParams, RegularExpenses} from 'form/models/statementOfMeans/expensesAndIncome/regularExpenses';
import {CCDExpensesType, CCDRecurringExpenses} from 'models/ccdResponse/ccdRecurringExpenses';

describe('translate recurring expense to CCD model', () => {
  it('should return undefined if it is empty', () => {
    //Given
    const input = new Claim();
    //When
    const output = toCCDRecurringExpensesField(input, ResponseType.FULL_ADMISSION);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return undefined if it is undefined', () => {
    //Given
    const input = new Claim();
    input.respondent1 = undefined;
    //When
    const output = toCCDRecurringExpensesField(input, ResponseType.FULL_ADMISSION);
    //Then
    expect(output).toEqual(undefined);
  });

  it('should return value if expense is undefined', () => {
    //Given
    const expenseParams : ExpenseParams = {
    };
    const input = new Claim();
    input.respondent1 = {
      responseType: ResponseType.FULL_ADMISSION,
    };
    input.statementOfMeans = new StatementOfMeans();
    input.statementOfMeans.regularExpenses = new RegularExpenses(expenseParams);
    //When
    const output = toCCDRecurringExpensesField(input, ResponseType.FULL_ADMISSION);
    //Then
    expect(output).toEqual(undefined);
  });

  it('should return undefined if response type is different', () => {
    //Given
    const expenseParams : ExpenseParams = {
      mortgage: setUpTransactionInput(true),
    };
    const input = new Claim();
    input.respondent1 = {
      responseType: ResponseType.FULL_ADMISSION,
    };
    input.statementOfMeans = new StatementOfMeans();
    input.statementOfMeans.regularExpenses = new RegularIncome(expenseParams);
    //When
    const output = toCCDRecurringExpensesField(input, ResponseType.PART_ADMISSION);
    //Then
    expect(output).toEqual(undefined);
  });

  it('should return empty if all are not declared', () => {
    //Given
    const expenseParams : ExpenseParams = {
      mortgage: setUpTransactionInput(false),
      rent: setUpTransactionInput(false),
      councilTax: setUpTransactionInput(false),
      gas: setUpTransactionInput(false),
      electricity: setUpTransactionInput(false),
      water: setUpTransactionInput(false),
      travel: setUpTransactionInput(false),
      schoolCosts: setUpTransactionInput(false),
      foodAndHousekeeping: setUpTransactionInput(false),
      tvAndBroadband: setUpTransactionInput(false),
      hirePurchase: setUpTransactionInput(false),
      mobilePhone: setUpTransactionInput(false),
      maintenance: setUpTransactionInput(false),
      other: setUpOtherTransactionInput(false),
    };
    const input = new Claim();
    input.respondent1 = {
      responseType: ResponseType.FULL_ADMISSION,
    };
    input.statementOfMeans = new StatementOfMeans();
    input.statementOfMeans.regularExpenses = new RegularExpenses(expenseParams);
    //When
    const output = toCCDRecurringExpensesField(input, ResponseType.FULL_ADMISSION);
    //Then
    expect(output).toEqual(undefined);
  });

  it('should return empty if all are declared', () => {
    //Given
    const expenseParams : ExpenseParams = {
      mortgage: setUpTransactionInput(true),
      rent: setUpTransactionInput(true),
      councilTax: setUpTransactionInput(true),
      gas: setUpTransactionInput(true),
      electricity: setUpTransactionInput(true),
      water: setUpTransactionInput(true),
      travel: setUpTransactionInput(true),
      schoolCosts: setUpTransactionInput(true),
      foodAndHousekeeping: setUpTransactionInput(true),
      tvAndBroadband: setUpTransactionInput(true),
      hirePurchase: setUpTransactionInput(true),
      mobilePhone: setUpTransactionInput(true),
      maintenance: setUpTransactionInput(true),
      other: setUpOtherTransactionInput(true),
    };
    const input = new Claim();
    input.respondent1 = {
      responseType: ResponseType.FULL_ADMISSION,
    };
    input.statementOfMeans = new StatementOfMeans();
    input.statementOfMeans.regularExpenses = new RegularExpenses(expenseParams);
    const expected : CCDRecurringExpenses[] = [
      setUpRecurringOutput(CCDExpensesType.MORTGAGE, CCDPaymentFrequency.ONCE_ONE_WEEK),
      setUpRecurringOutput(CCDExpensesType.RENT, CCDPaymentFrequency.ONCE_ONE_WEEK),
      setUpRecurringOutput(CCDExpensesType.COUNCIL_TAX, CCDPaymentFrequency.ONCE_ONE_WEEK),
      setUpRecurringOutput(CCDExpensesType.GAS, CCDPaymentFrequency.ONCE_ONE_WEEK),
      setUpRecurringOutput(CCDExpensesType.ELECTRICITY, CCDPaymentFrequency.ONCE_ONE_WEEK),
      setUpRecurringOutput(CCDExpensesType.WATER, CCDPaymentFrequency.ONCE_ONE_WEEK),
      setUpRecurringOutput(CCDExpensesType.TRAVEL, CCDPaymentFrequency.ONCE_ONE_WEEK),
      setUpRecurringOutput(CCDExpensesType.SCHOOL, CCDPaymentFrequency.ONCE_ONE_WEEK),
      setUpRecurringOutput(CCDExpensesType.FOOD, CCDPaymentFrequency.ONCE_ONE_WEEK),
      setUpRecurringOutput(CCDExpensesType.TV, CCDPaymentFrequency.ONCE_ONE_WEEK),
      setUpRecurringOutput(CCDExpensesType.HIRE_PURCHASE, CCDPaymentFrequency.ONCE_ONE_WEEK),
      setUpRecurringOutput(CCDExpensesType.MOBILE_PHONE, CCDPaymentFrequency.ONCE_ONE_WEEK),
      setUpRecurringOutput(CCDExpensesType.MAINTENANCE, CCDPaymentFrequency.ONCE_ONE_WEEK),
      setUpOtherRecurringOutput(CCDExpensesType.OTHER, CCDPaymentFrequency.ONCE_ONE_WEEK),
    ];
    //When
    const output = toCCDRecurringExpensesField(input, ResponseType.FULL_ADMISSION);
    //Then
    expect(output).toEqual(expected);
  });

  it('should return empty if all are declared undefined', () => {
    //Given
    const expenseParams : ExpenseParams = {
      mortgage: undefined,
      rent: undefined,
      councilTax: undefined,
      gas: undefined,
      electricity: undefined,
      water: undefined,
      travel: undefined,
      schoolCosts: undefined,
      foodAndHousekeeping: undefined,
      tvAndBroadband: undefined,
      hirePurchase: undefined,
      mobilePhone: undefined,
      maintenance: undefined,
      other: undefined,
    };
    const input = new Claim();
    input.respondent1 = {
      responseType: ResponseType.FULL_ADMISSION,
    };
    input.statementOfMeans = new StatementOfMeans();
    input.statementOfMeans.regularExpenses = new RegularExpenses(expenseParams);
    //When
    const output = toCCDRecurringExpensesField(input, ResponseType.FULL_ADMISSION);
    //Then
    expect(output).toEqual(undefined);
  });

  it('should return empty if all values are undefined', () => {
    //Given
    const expenseParams : ExpenseParams = {
      mortgage: setUpTransactionInputUndefined(),
      rent: setUpTransactionInputUndefined(),
      councilTax: setUpTransactionInputUndefined(),
      gas: setUpTransactionInputUndefined(),
      electricity: setUpTransactionInputUndefined(),
      water: setUpTransactionInputUndefined(),
      travel: setUpTransactionInputUndefined(),
      schoolCosts: setUpTransactionInputUndefined(),
      foodAndHousekeeping: setUpTransactionInputUndefined(),
      tvAndBroadband: setUpTransactionInputUndefined(),
      hirePurchase: setUpTransactionInputUndefined(),
      mobilePhone: setUpTransactionInputUndefined(),
      maintenance: setUpTransactionInputUndefined(),
      other: setUpOtherTransactionInputUndefined(),
    };
    const input = new Claim();
    input.respondent1 = {
      responseType: ResponseType.FULL_ADMISSION,
    };
    input.statementOfMeans = new StatementOfMeans();
    input.statementOfMeans.regularExpenses = new RegularExpenses(expenseParams);
    const expected : CCDRecurringExpenses[] = [
      setUpRecurringOutputUndefined(CCDExpensesType.MORTGAGE),
      setUpRecurringOutputUndefined(CCDExpensesType.RENT),
      setUpRecurringOutputUndefined(CCDExpensesType.COUNCIL_TAX),
      setUpRecurringOutputUndefined(CCDExpensesType.GAS),
      setUpRecurringOutputUndefined(CCDExpensesType.ELECTRICITY),
      setUpRecurringOutputUndefined(CCDExpensesType.WATER),
      setUpRecurringOutputUndefined(CCDExpensesType.TRAVEL),
      setUpRecurringOutputUndefined(CCDExpensesType.SCHOOL),
      setUpRecurringOutputUndefined(CCDExpensesType.FOOD),
      setUpRecurringOutputUndefined(CCDExpensesType.TV),
      setUpRecurringOutputUndefined(CCDExpensesType.HIRE_PURCHASE),
      setUpRecurringOutputUndefined(CCDExpensesType.MOBILE_PHONE),
      setUpRecurringOutputUndefined(CCDExpensesType.MAINTENANCE),
      undefined,
    ];
    //When
    const output = toCCDRecurringExpensesField(input, ResponseType.FULL_ADMISSION);
    //Then
    expect(output).toEqual(expected);
  });

  it('should return empty if all values content are undefined', () => {
    //Given
    const expenseParams : ExpenseParams = {
      mortgage: setUpTransactionInputContentUndefined(),
      rent: setUpTransactionInputContentUndefined(),
      councilTax: setUpTransactionInputContentUndefined(),
      gas: setUpTransactionInputContentUndefined(),
      electricity: setUpTransactionInputContentUndefined(),
      water: setUpTransactionInputContentUndefined(),
      travel: setUpTransactionInputContentUndefined(),
      schoolCosts: setUpTransactionInputContentUndefined(),
      foodAndHousekeeping: setUpTransactionInputContentUndefined(),
      tvAndBroadband: setUpTransactionInputContentUndefined(),
      hirePurchase: setUpTransactionInputContentUndefined(),
      mobilePhone: setUpTransactionInputContentUndefined(),
      maintenance: setUpTransactionInputContentUndefined(),
      other: setUpOtherTransactionInputContentUndefined(),
    };
    const input = new Claim();
    input.respondent1 = {
      responseType: ResponseType.FULL_ADMISSION,
    };
    input.statementOfMeans = new StatementOfMeans();
    input.statementOfMeans.regularExpenses = new RegularExpenses(expenseParams);
    const expected : CCDRecurringExpenses[] = [
      setUpRecurringOutputUndefined(CCDExpensesType.MORTGAGE),
      setUpRecurringOutputUndefined(CCDExpensesType.RENT),
      setUpRecurringOutputUndefined(CCDExpensesType.COUNCIL_TAX),
      setUpRecurringOutputUndefined(CCDExpensesType.GAS),
      setUpRecurringOutputUndefined(CCDExpensesType.ELECTRICITY),
      setUpRecurringOutputUndefined(CCDExpensesType.WATER),
      setUpRecurringOutputUndefined(CCDExpensesType.TRAVEL),
      setUpRecurringOutputUndefined(CCDExpensesType.SCHOOL),
      setUpRecurringOutputUndefined(CCDExpensesType.FOOD),
      setUpRecurringOutputUndefined(CCDExpensesType.TV),
      setUpRecurringOutputUndefined(CCDExpensesType.HIRE_PURCHASE),
      setUpRecurringOutputUndefined(CCDExpensesType.MOBILE_PHONE),
      setUpRecurringOutputUndefined(CCDExpensesType.MAINTENANCE),
      setUpOtherRecurringOutputUndefined(CCDExpensesType.OTHER),
    ];
    //When
    const output = toCCDRecurringExpensesField(input, ResponseType.FULL_ADMISSION);
    //Then
    expect(output).toEqual(expected);
  });
});

const setUpTransactionInput = (declared : boolean): Transaction => {
  const transactionSourceParams : TransactionSourceParams = {
    isIncome: false,
    nameRequired: true,
    name: 'test',
    amount: Number(1),
    schedule: TransactionSchedule.WEEK,
  };
  const transactionSource = new TransactionSource(transactionSourceParams);
  const transaction = new Transaction(declared, transactionSource);

  return transaction;
};

const setUpOtherTransactionInput = (declared : boolean): OtherTransaction => {
  const transactionSourceParams : TransactionSourceParams = {
    isIncome: false,
    nameRequired: true,
    name: 'test',
    amount: Number(1),
    schedule: TransactionSchedule.WEEK,
  };
  const transactionSource = new TransactionSource(transactionSourceParams);
  const transactionSourceList : TransactionSource[] = [transactionSource];
  const otherTransaction = new OtherTransaction(declared, transactionSourceList);

  return otherTransaction;
};

const setUpTransactionInputUndefined = (): Transaction => {
  const transaction = new Transaction(true, undefined);

  return transaction;
};

const setUpOtherTransactionInputUndefined = (): OtherTransaction => {
  const otherTransaction = new OtherTransaction(true, undefined);

  return otherTransaction;
};

const setUpTransactionInputContentUndefined = (): Transaction => {
  const transactionSourceParams : TransactionSourceParams = {
    isIncome: false,
    nameRequired: true,
    name: 'test',
    amount: undefined,
    schedule: undefined,
  };
  const transactionSource = new TransactionSource(transactionSourceParams);
  const transaction = new Transaction(true, transactionSource);

  return transaction;
};

const setUpOtherTransactionInputContentUndefined = (): OtherTransaction => {
  const transactionSourceParams : TransactionSourceParams = {
    isIncome: false,
    nameRequired: true,
    name: undefined,
    amount: undefined,
    schedule: undefined,
  };
  const transactionSource = new TransactionSource(transactionSourceParams);
  const transactionSourceList : TransactionSource[] = [transactionSource];
  const otherTransaction = new OtherTransaction(true, transactionSourceList);

  return otherTransaction;
};

const setUpRecurringOutput = (type: CCDExpensesType, frequency :CCDPaymentFrequency): CCDRecurringExpenses => {
  return {
    value: {
      type: type,
      typeOtherDetails: undefined,
      amount: Number(100),
      frequency: frequency,
    },
  };
};

const setUpOtherRecurringOutput = (type: CCDExpensesType, frequency :CCDPaymentFrequency): CCDRecurringExpenses => {
  return {
    value: {
      type: type,
      typeOtherDetails: 'test',
      amount: Number(100),
      frequency: frequency,
    },
  };
};

const setUpRecurringOutputUndefined = (type: CCDExpensesType): CCDRecurringExpenses => {
  return {
    value: {
      type: type,
      typeOtherDetails: undefined,
      amount: undefined,
      frequency: undefined,
    },
  };
};

const setUpOtherRecurringOutputUndefined = (type: CCDExpensesType): CCDRecurringExpenses => {
  return {
    value: {
      type: type,
      typeOtherDetails: undefined,
      amount: undefined,
      frequency: undefined,
    },
  };
};
