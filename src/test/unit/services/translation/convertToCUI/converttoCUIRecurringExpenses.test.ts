import {Transaction} from 'form/models/statementOfMeans/expensesAndIncome/transaction';
import {OtherTransaction} from 'form/models/statementOfMeans/expensesAndIncome/otherTransaction';
import {CCDPaymentFrequency} from 'models/ccdResponse/ccdPaymentFrequency';
import {TransactionSource} from 'form/models/statementOfMeans/expensesAndIncome/transactionSource';
import {TransactionSchedule} from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {toCUIRecurringExpense} from 'services/translation/convertToCUI/convertToCUIRecurringExpense';
import {CCDExpensesType, CCDRecurringExpenses, CCDRecurringExpensesItem} from 'models/ccdResponse/ccdRecurringExpenses';
import {RegularExpenses} from 'form/models/statementOfMeans/expensesAndIncome/regularExpenses';
import {ExpenseType} from 'form/models/statementOfMeans/expensesAndIncome/expenseType';

describe('translate Recurring Expenses to CUI model', () => {
  it('should return undefined if Recurring Expenses doesnt exist', () => {
    //Given
    //When
    const output = toCUIRecurringExpense(undefined);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return undefined if Recurring Expense details empty', () => {
    //Given
    const input : CCDRecurringExpenses[] = [];
    //When
    const output = toCUIRecurringExpense(input);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return data if Recurring Expense details data exist', () => {
    //Given
    const input : CCDRecurringExpenses[] = [
      { value : setUpCcdRecurringExpenses(CCDExpensesType.MORTGAGE)},
      { value : setUpCcdRecurringExpenses(CCDExpensesType.RENT)},
      { value : setUpCcdRecurringExpenses(CCDExpensesType.COUNCIL_TAX)},
      { value : setUpCcdRecurringExpenses(CCDExpensesType.GAS)},
      { value : setUpCcdRecurringExpenses(CCDExpensesType.ELECTRICITY)},
      { value : setUpCcdRecurringExpenses(CCDExpensesType.WATER)},
      { value : setUpCcdRecurringExpenses(CCDExpensesType.TRAVEL)},
      { value : setUpCcdRecurringExpenses(CCDExpensesType.SCHOOL)},
      { value : setUpCcdRecurringExpenses(CCDExpensesType.FOOD)},
      { value : setUpCcdRecurringExpenses(CCDExpensesType.TV)},
      { value : setUpCcdRecurringExpenses(CCDExpensesType.HIRE_PURCHASE)},
      { value : setUpCcdRecurringExpenses(CCDExpensesType.MOBILE_PHONE)},
      { value : setUpCcdRecurringExpenses(CCDExpensesType.MAINTENANCE)},
      { value : setUpCcdRecurringOtherExpenses(CCDExpensesType.OTHER)},
    ];
    //When
    const output = toCUIRecurringExpense(input);
    //Then
    const expected : RegularExpenses= {
      mortgage: new Transaction(true, setUpTransactionSource(ExpenseType.MORTGAGE)),
      rent: new Transaction(true, setUpTransactionSource(ExpenseType.RENT)),
      councilTax: new Transaction(true, setUpTransactionSource(ExpenseType.COUNCIL_TAX)),
      gas: new Transaction(true, setUpTransactionSource(ExpenseType.GAS)),
      electricity: new Transaction(true, setUpTransactionSource(ExpenseType.ELECTRICITY)),
      water: new Transaction(true, setUpTransactionSource(ExpenseType.WATER)),
      travel: new Transaction(true, setUpTransactionSource(ExpenseType.TRAVEL)),
      schoolCosts: new Transaction(true, setUpTransactionSource(ExpenseType.SCHOOL_COSTS)),
      foodAndHousekeeping: new Transaction(true, setUpTransactionSource(ExpenseType.FOOD_HOUSEKEEPING)),
      tvAndBroadband: new Transaction(true, setUpTransactionSource(ExpenseType.TV_AND_BROADBAND)),
      hirePurchase: new Transaction(true, setUpTransactionSource(ExpenseType.HIRE_PURCHASES)),
      mobilePhone: new Transaction(true, setUpTransactionSource(ExpenseType.MOBILE_PHONE)),
      maintenance: new Transaction(true, setUpTransactionSource(ExpenseType.MAINTENANCE_PAYMENTS)),
      other: new OtherTransaction(true, [setUpTransactionSourceOther()]),
    };
    expect(output).toEqual(expected);
  });

  it('should return data if Recurring Expense details data undefined', () => {
    //Given
    const input : CCDRecurringExpenses[] = [
      { value : setUpCcdRecurringExpensesUndefined()},
    ];
    //When
    const output = toCUIRecurringExpense(input);
    //Then
    const expected : RegularExpenses= {
      mortgage: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.MORTGAGE)),
      rent: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.RENT)),
      councilTax: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.COUNCIL_TAX)),
      gas: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.GAS)),
      electricity: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.ELECTRICITY)),
      water: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.WATER)),
      travel: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.TRAVEL)),
      schoolCosts: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.SCHOOL_COSTS)),
      foodAndHousekeeping: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.FOOD_HOUSEKEEPING)),
      tvAndBroadband: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.TV_AND_BROADBAND)),
      hirePurchase: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.HIRE_PURCHASES)),
      mobilePhone: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.MOBILE_PHONE)),
      maintenance: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.MAINTENANCE_PAYMENTS)),
      other: new OtherTransaction(false, [setUpTransactionSourceOtherUndefined()]),
    };
    expect(output).toEqual(expected);
  });

  it('should return data if Recurring Expense details value undefined', () => {
    //Given
    const input : CCDRecurringExpenses[] = [
      { value : undefined },
    ];
    //When
    const output = toCUIRecurringExpense(input);
    //Then
    const expected : RegularExpenses= {
      mortgage: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.MORTGAGE)),
      rent: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.RENT)),
      councilTax: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.COUNCIL_TAX)),
      gas: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.GAS)),
      electricity: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.ELECTRICITY)),
      water: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.WATER)),
      travel: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.TRAVEL)),
      schoolCosts: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.SCHOOL_COSTS)),
      foodAndHousekeeping: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.FOOD_HOUSEKEEPING)),
      tvAndBroadband: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.TV_AND_BROADBAND)),
      hirePurchase: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.HIRE_PURCHASES)),
      mobilePhone: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.MOBILE_PHONE)),
      maintenance: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.MAINTENANCE_PAYMENTS)),
      other: new OtherTransaction(false, [setUpTransactionSourceOtherUndefined()]),
    };
    expect(output).toEqual(expected);
  });

  it('should return undefined data if Recurring Expense details data is undefined', () => {
    //Given
    const input : CCDRecurringExpenses[] = [
      { value : setUpCcdRecurringOtherExpensesValueUndefined(CCDExpensesType.MORTGAGE)},
      { value : setUpCcdRecurringOtherExpensesValueUndefined(CCDExpensesType.RENT)},
      { value : setUpCcdRecurringOtherExpensesValueUndefined(CCDExpensesType.COUNCIL_TAX)},
      { value : setUpCcdRecurringOtherExpensesValueUndefined(CCDExpensesType.GAS)},
      { value : setUpCcdRecurringOtherExpensesValueUndefined(CCDExpensesType.ELECTRICITY)},
      { value : setUpCcdRecurringOtherExpensesValueUndefined(CCDExpensesType.WATER)},
      { value : setUpCcdRecurringOtherExpensesValueUndefined(CCDExpensesType.TRAVEL)},
      { value : setUpCcdRecurringOtherExpensesValueUndefined(CCDExpensesType.SCHOOL)},
      { value : setUpCcdRecurringOtherExpensesValueUndefined(CCDExpensesType.FOOD)},
      { value : setUpCcdRecurringOtherExpensesValueUndefined(CCDExpensesType.TV)},
      { value : setUpCcdRecurringOtherExpensesValueUndefined(CCDExpensesType.HIRE_PURCHASE)},
      { value : setUpCcdRecurringOtherExpensesValueUndefined(CCDExpensesType.MOBILE_PHONE)},
      { value : setUpCcdRecurringOtherExpensesValueUndefined(CCDExpensesType.MAINTENANCE)},
      { value : setUpCcdRecurringOtherExpensesValueUndefined(CCDExpensesType.OTHER)},
    ];
    //When
    const output = toCUIRecurringExpense(input);
    //Then
    const expected : RegularExpenses= {
      mortgage: new Transaction(true, setUpTransactionSourceValueUndefined(ExpenseType.MORTGAGE)),
      rent: new Transaction(true, setUpTransactionSourceValueUndefined(ExpenseType.RENT)),
      councilTax: new Transaction(true, setUpTransactionSourceValueUndefined(ExpenseType.COUNCIL_TAX)),
      gas: new Transaction(true, setUpTransactionSourceValueUndefined(ExpenseType.GAS)),
      electricity: new Transaction(true, setUpTransactionSourceValueUndefined(ExpenseType.ELECTRICITY)),
      water: new Transaction(true, setUpTransactionSourceValueUndefined(ExpenseType.WATER)),
      travel: new Transaction(true, setUpTransactionSourceValueUndefined(ExpenseType.TRAVEL)),
      schoolCosts: new Transaction(true, setUpTransactionSourceValueUndefined(ExpenseType.SCHOOL_COSTS)),
      foodAndHousekeeping: new Transaction(true, setUpTransactionSourceValueUndefined(ExpenseType.FOOD_HOUSEKEEPING)),
      tvAndBroadband: new Transaction(true, setUpTransactionSourceValueUndefined(ExpenseType.TV_AND_BROADBAND)),
      hirePurchase: new Transaction(true, setUpTransactionSourceValueUndefined(ExpenseType.HIRE_PURCHASES)),
      mobilePhone: new Transaction(true, setUpTransactionSourceValueUndefined(ExpenseType.MOBILE_PHONE)),
      maintenance: new Transaction(true, setUpTransactionSourceValueUndefined(ExpenseType.MAINTENANCE_PAYMENTS)),
      other: new OtherTransaction(true, [setUpTransactionSourceOtherValueUndefined()]),
    };
    expect(output).toEqual(expected);
  });
});

const setUpCcdRecurringExpenses = (expenseType : CCDExpensesType) : CCDRecurringExpensesItem => {
  return {
    type: expenseType,
    typeOtherDetails: undefined,
    amount: 10000,
    frequency: CCDPaymentFrequency.ONCE_ONE_WEEK,
  };
};

const setUpCcdRecurringOtherExpenses = (expenseType : CCDExpensesType) : CCDRecurringExpensesItem => {
  return {
    type: expenseType,
    typeOtherDetails: 'test',
    amount: 10000,
    frequency: CCDPaymentFrequency.ONCE_ONE_WEEK,
  };
};

const setUpCcdRecurringOtherExpensesValueUndefined = (expenseType : CCDExpensesType) : CCDRecurringExpensesItem => {
  return {
    type: expenseType,
    typeOtherDetails: undefined,
    amount: undefined,
    frequency: undefined,
  };
};

const setUpCcdRecurringExpensesUndefined = () : CCDRecurringExpensesItem => {
  return {
    type: undefined,
    typeOtherDetails: undefined,
    amount: undefined,
    frequency: undefined,
  };
};

const setUpTransactionSource = (expenseType : ExpenseType) : TransactionSource => {
  return new TransactionSource(
    {
      name : expenseType,
      amount : 100,
      schedule : TransactionSchedule.WEEK,
      isIncome : false,
      nameRequired : undefined,
    },
  );
};

const setUpTransactionSourceOther = () : TransactionSource => {
  return new TransactionSource(
    {
      name : 'test',
      amount : 100,
      schedule : TransactionSchedule.WEEK,
      isIncome : false,
      nameRequired : true,
    },
  );
};

const setUpTransactionSourceUndefined = (expenseType : ExpenseType) : TransactionSource => {
  return new TransactionSource(
    {
      name : expenseType,
      amount : undefined,
      schedule : undefined,
      isIncome : undefined,
      nameRequired : undefined,
    },
  );
};

const setUpTransactionSourceValueUndefined = (expenseType : ExpenseType) : TransactionSource => {
  return new TransactionSource(
    {
      name : expenseType,
      amount : undefined,
      schedule : undefined,
      isIncome : false,
      nameRequired : undefined,
    },
  );
};

const setUpTransactionSourceOtherUndefined = () : TransactionSource => {
  return new TransactionSource(
    {
      name : undefined,
      amount : undefined,
      schedule : undefined,
      isIncome : false,
      nameRequired : undefined,
    },
  );
};

const setUpTransactionSourceOtherValueUndefined = () : TransactionSource => {
  return new TransactionSource(
    {
      name : undefined,
      amount : undefined,
      schedule : undefined,
      isIncome : false,
      nameRequired : true,
    },
  );
};

