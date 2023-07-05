import {toCUIPriorityDebts} from 'services/translation/convertToCUI/convertToCUIPriorityDebts';
import {CCDDebtDetails, CCDDebtDetailsItem, CCDDebtType} from 'models/ccdResponse/ccdDebtDetails';
import {PriorityDebts} from 'form/models/statementOfMeans/priorityDebts';
import {CCDPaymentFrequency} from 'models/ccdResponse/ccdPaymentFrequency';
import {Transaction} from 'form/models/statementOfMeans/expensesAndIncome/transaction';
import {TransactionSource} from 'form/models/statementOfMeans/expensesAndIncome/transactionSource';
import {ExpenseType} from 'form/models/statementOfMeans/expensesAndIncome/expenseType';
import {TransactionSchedule} from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';

describe('translate Priority Debts to CUI model', () => {
  it('should return undefined if Priority Debts doesnt exist', () => {
    //Given
    //When
    const output = toCUIPriorityDebts(undefined);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return undefined if Priority Debts details undefined', () => {
    //Given
    const input : CCDDebtDetails = {
      debtDetails: undefined,
    };
    //When
    const output = toCUIPriorityDebts(input);
    //Then
    const expected : PriorityDebts = {
      councilTax: undefined,
      electricity: undefined,
      gas: undefined,
      maintenance: undefined,
      mortgage: undefined,
      rent: undefined,
      water: undefined,
    };
    expect(output).toEqual(expected);
  });

  it('should return undefined if Priority Debts data empty list', () => {
    //Given
    const input : CCDDebtDetails = {
      debtDetails: [],
    };
    //When
    const output = toCUIPriorityDebts(input);
    //Then
    const expected : PriorityDebts = {
      councilTax: undefined,
      electricity: undefined,
      gas: undefined,
      maintenance: undefined,
      mortgage: undefined,
      rent: undefined,
      water: undefined,
    };
    expect(output).toEqual(expected);
  });

  it('should return data if Priority Debts data', () => {
    //Given
    const input : CCDDebtDetails = {
      debtDetails: [
        {
          value: setUpCcdPriorityDebts(CCDDebtType.COUNCIL_TAX),
        },
        {
          value: setUpCcdPriorityDebts(CCDDebtType.ELECTRICITY),
        },
        {
          value: setUpCcdPriorityDebts(CCDDebtType.GAS),
        },
        {
          value: setUpCcdPriorityDebts(CCDDebtType.MAINTENANCE_PAYMENTS),
        },
        {
          value: setUpCcdPriorityDebts(CCDDebtType.MORTGAGE),
        },
        {
          value: setUpCcdPriorityDebts(CCDDebtType.RENT),
        },
        {
          value: setUpCcdPriorityDebts(CCDDebtType.WATER),
        },
      ],
    };
    //When
    const output = toCUIPriorityDebts(input);
    //Then
    const expected : PriorityDebts = {
      councilTax: new Transaction(true, setUpTransactionSource(ExpenseType.COUNCIL_TAX_OR_COMMUNITY_CHARGE)),
      electricity: new Transaction(true, setUpTransactionSource(ExpenseType.ELECTRICITY_DEBT)),
      gas: new Transaction(true, setUpTransactionSource(ExpenseType.GAS_DEBT)),
      maintenance: new Transaction(true, setUpTransactionSource(ExpenseType.MAINTENANCE_PAYMENTS_DEBT)),
      mortgage: new Transaction(true, setUpTransactionSource(ExpenseType.MORTGAGE_DEBT)),
      rent: new Transaction(true, setUpTransactionSource(ExpenseType.RENT_DEBT)),
      water: new Transaction(true, setUpTransactionSource(ExpenseType.WATER_DEBT)),
    };
    expect(output).toEqual(expected);
  });

  it('should return undefined if Priority Debts data undefined', () => {
    //Given
    const input : CCDDebtDetails = {
      debtDetails: [
        {
          value : {
            debtType: undefined,
            paymentAmount: undefined,
            paymentFrequency: undefined,
          },
        },
      ],
    };
    //When
    const output = toCUIPriorityDebts(input);
    //Then
    const expected : PriorityDebts = {
      councilTax: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.COUNCIL_TAX_OR_COMMUNITY_CHARGE)),
      electricity: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.ELECTRICITY_DEBT)),
      gas: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.GAS_DEBT)),
      maintenance: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.MAINTENANCE_PAYMENTS_DEBT)),
      mortgage: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.MORTGAGE_DEBT)),
      rent: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.RENT_DEBT)),
      water: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.WATER_DEBT)),
    };
    expect(output).toEqual(expected);
  });

  it('should return undefined if Priority Debts value undefined', () => {
    //Given
    const input : CCDDebtDetails = {
      debtDetails: [
        {
          value : undefined,
        },
      ],
    };
    //When
    const output = toCUIPriorityDebts(input);
    //Then
    const expected : PriorityDebts = {
      councilTax: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.COUNCIL_TAX_OR_COMMUNITY_CHARGE)),
      electricity: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.ELECTRICITY_DEBT)),
      gas: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.GAS_DEBT)),
      maintenance: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.MAINTENANCE_PAYMENTS_DEBT)),
      mortgage: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.MORTGAGE_DEBT)),
      rent: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.RENT_DEBT)),
      water: new Transaction(undefined, setUpTransactionSourceUndefined(ExpenseType.WATER_DEBT)),
    };
    expect(output).toEqual(expected);
  });
});

const setUpCcdPriorityDebts = (debtType : CCDDebtType) : CCDDebtDetailsItem => {
  return {
    debtType: debtType,
    paymentAmount: 10000,
    paymentFrequency: CCDPaymentFrequency.ONCE_ONE_WEEK,
  };
};

const setUpTransactionSource = (debtType : ExpenseType) : TransactionSource => {
  return new TransactionSource(
    {
      name : debtType,
      amount : 100,
      schedule : TransactionSchedule.WEEK,
      isIncome : undefined,
      nameRequired : undefined,
    },
  );
};

const setUpTransactionSourceUndefined = (debtType : ExpenseType) : TransactionSource => {
  return new TransactionSource(
    {
      name : debtType,
      amount : undefined,
      schedule : undefined,
      isIncome : undefined,
      nameRequired : undefined,
    },
  );
};
