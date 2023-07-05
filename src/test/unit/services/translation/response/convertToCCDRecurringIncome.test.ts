import {toCCDRecurringIncomeField} from 'services/translation/response/convertToCCDRecurringIncome';
import {ResponseType} from 'form/models/responseType';
import {Claim} from 'models/claim';
import {StatementOfMeans} from 'models/statementOfMeans';
import {IncomeParams, RegularIncome} from 'form/models/statementOfMeans/expensesAndIncome/regularIncome';
import {
  TransactionSource,
  TransactionSourceParams,
} from 'form/models/statementOfMeans/expensesAndIncome/transactionSource';
import {TransactionSchedule} from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {Transaction} from 'form/models/statementOfMeans/expensesAndIncome/transaction';
import {CCDIncomeType, CCDRecurringIncome} from 'models/ccdResponse/ccdRecurringIncome';
import {CCDPaymentFrequency} from 'models/ccdResponse/ccdPaymentFrequency';
import {OtherTransaction} from 'form/models/statementOfMeans/expensesAndIncome/otherTransaction';

describe('translate recurring income to CCD model', () => {
  it('should return undefined if it is empty', () => {
    //Given
    const input = new Claim();
    //When
    const output = toCCDRecurringIncomeField(input, ResponseType.FULL_ADMISSION);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return undefined if it is undefined', () => {
    //Given
    const input = new Claim();
    input.respondent1 = undefined;
    //When
    const output = toCCDRecurringIncomeField(input, ResponseType.FULL_ADMISSION);
    //Then
    expect(output).toEqual(undefined);
  });

  it('should return value if income is undefined', () => {
    //Given
    const incomeParams : IncomeParams = {
    };
    const input = new Claim();
    input.respondent1 = {
      responseType: ResponseType.FULL_ADMISSION,
    };
    input.statementOfMeans = new StatementOfMeans();
    input.statementOfMeans.regularIncome = new RegularIncome(incomeParams);
    //When
    const output = toCCDRecurringIncomeField(input, ResponseType.FULL_ADMISSION);
    //Then
    expect(output).toEqual(undefined);
  });

  it('should return undefined if response type is different', () => {
    //Given
    const incomeParams : IncomeParams = {
      job: setUpTransactionInput(true),
    };
    const input = new Claim();
    input.respondent1 = {
      responseType: ResponseType.FULL_ADMISSION,
    };
    input.statementOfMeans = new StatementOfMeans();
    input.statementOfMeans.regularIncome = new RegularIncome(incomeParams);
    //When
    const output = toCCDRecurringIncomeField(input, ResponseType.PART_ADMISSION);
    //Then
    expect(output).toEqual(undefined);
  });

  it('should return empty if all are not declared', () => {
    //Given
    const incomeParams : IncomeParams = {
      job: setUpTransactionInput(false),
      universalCredit: setUpTransactionInput(false),
      jobseekerAllowanceIncome: setUpTransactionInput(false),
      jobseekerAllowanceContribution: setUpTransactionInput(false),
      incomeSupport: setUpTransactionInput(false),
      workingTaxCredit: setUpTransactionInput(false),
      childTaxCredit: setUpTransactionInput(false),
      childBenefit: setUpTransactionInput(false),
      councilTaxSupport: setUpTransactionInput(false),
      pension: setUpTransactionInput(false),
      other: setUpOtherTransactionInput(false),
    };
    const input = new Claim();
    input.respondent1 = {
      responseType: ResponseType.FULL_ADMISSION,
    };
    input.statementOfMeans = new StatementOfMeans();
    input.statementOfMeans.regularIncome = new RegularIncome(incomeParams);
    //When
    const output = toCCDRecurringIncomeField(input, ResponseType.FULL_ADMISSION);
    //Then
    expect(output).toEqual(undefined);
  });

  it('should return empty if all are declared', () => {
    //Given
    const incomeParams : IncomeParams = {
      job: setUpTransactionInput(true),
      universalCredit: setUpTransactionInput(true),
      jobseekerAllowanceIncome: setUpTransactionInput(true),
      jobseekerAllowanceContribution: setUpTransactionInput(true),
      incomeSupport: setUpTransactionInput(true),
      workingTaxCredit: setUpTransactionInput(true),
      childTaxCredit: setUpTransactionInput(true),
      childBenefit: setUpTransactionInput(true),
      councilTaxSupport: setUpTransactionInput(true),
      pension: setUpTransactionInput(true),
      other: setUpOtherTransactionInput(true),
    };
    const input = new Claim();
    input.respondent1 = {
      responseType: ResponseType.FULL_ADMISSION,
    };
    input.statementOfMeans = new StatementOfMeans();
    input.statementOfMeans.regularIncome = new RegularIncome(incomeParams);
    const expected : CCDRecurringIncome[] = [
      setUpRecurringOutput(CCDIncomeType.JOB, CCDPaymentFrequency.ONCE_ONE_WEEK),
      setUpRecurringOutput(CCDIncomeType.UNIVERSAL_CREDIT, CCDPaymentFrequency.ONCE_ONE_WEEK),
      setUpRecurringOutput(CCDIncomeType.JOBSEEKER_ALLOWANCE_INCOME, CCDPaymentFrequency.ONCE_ONE_WEEK),
      setUpRecurringOutput(CCDIncomeType.JOBSEEKER_ALLOWANCE_CONTRIBUTION, CCDPaymentFrequency.ONCE_ONE_WEEK),
      setUpRecurringOutput(CCDIncomeType.INCOME_SUPPORT, CCDPaymentFrequency.ONCE_ONE_WEEK),
      setUpRecurringOutput(CCDIncomeType.WORKING_TAX_CREDIT, CCDPaymentFrequency.ONCE_ONE_WEEK),
      setUpRecurringOutput(CCDIncomeType.CHILD_TAX, CCDPaymentFrequency.ONCE_ONE_WEEK),
      setUpRecurringOutput(CCDIncomeType.CHILD_BENEFIT, CCDPaymentFrequency.ONCE_ONE_WEEK),
      setUpRecurringOutput(CCDIncomeType.COUNCIL_TAX_SUPPORT, CCDPaymentFrequency.ONCE_ONE_WEEK),
      setUpRecurringOutput(CCDIncomeType.PENSION, CCDPaymentFrequency.ONCE_ONE_WEEK),
      setUpOtherRecurringOutput(CCDIncomeType.OTHER, CCDPaymentFrequency.ONCE_ONE_WEEK),
    ];
    //When
    const output = toCCDRecurringIncomeField(input, ResponseType.FULL_ADMISSION);
    //Then
    expect(output).toEqual(expected);
  });

  it('should return undefined if all are undefined', () => {
    //Given
    const incomeParams : IncomeParams = {
      job: undefined,
      universalCredit: undefined,
      jobseekerAllowanceIncome: undefined,
      jobseekerAllowanceContribution: undefined,
      incomeSupport: undefined,
      workingTaxCredit: undefined,
      childTaxCredit: undefined,
      childBenefit: undefined,
      councilTaxSupport: undefined,
      pension: undefined,
      other: undefined,
    };
    const input = new Claim();
    input.respondent1 = {
      responseType: ResponseType.FULL_ADMISSION,
    };
    input.statementOfMeans = new StatementOfMeans();
    input.statementOfMeans.regularIncome = new RegularIncome(incomeParams);
    //When
    const output = toCCDRecurringIncomeField(input, ResponseType.FULL_ADMISSION);
    //Then
    expect(output).toEqual(undefined);
  });

  it('should return undefined if all values are undefined', () => {
    //Given
    const incomeParams : IncomeParams = {
      job: setUpTransactionInputUndefined(),
      universalCredit: setUpTransactionInputUndefined(),
      jobseekerAllowanceIncome: setUpTransactionInputUndefined(),
      jobseekerAllowanceContribution: setUpTransactionInputUndefined(),
      incomeSupport: setUpTransactionInputUndefined(),
      workingTaxCredit: setUpTransactionInputUndefined(),
      childTaxCredit: setUpTransactionInputUndefined(),
      childBenefit: setUpTransactionInputUndefined(),
      councilTaxSupport: setUpTransactionInputUndefined(),
      pension: setUpTransactionInputUndefined(),
      other: setUpOtherTransactionInputUndefined(),
    };
    const input = new Claim();
    input.respondent1 = {
      responseType: ResponseType.FULL_ADMISSION,
    };
    input.statementOfMeans = new StatementOfMeans();
    input.statementOfMeans.regularIncome = new RegularIncome(incomeParams);
    const expected : CCDRecurringIncome[] = [
      setUpRecurringOutputUndefined(CCDIncomeType.JOB),
      setUpRecurringOutputUndefined(CCDIncomeType.UNIVERSAL_CREDIT),
      setUpRecurringOutputUndefined(CCDIncomeType.JOBSEEKER_ALLOWANCE_INCOME),
      setUpRecurringOutputUndefined(CCDIncomeType.JOBSEEKER_ALLOWANCE_CONTRIBUTION),
      setUpRecurringOutputUndefined(CCDIncomeType.INCOME_SUPPORT),
      setUpRecurringOutputUndefined(CCDIncomeType.WORKING_TAX_CREDIT),
      setUpRecurringOutputUndefined(CCDIncomeType.CHILD_TAX),
      setUpRecurringOutputUndefined(CCDIncomeType.CHILD_BENEFIT),
      setUpRecurringOutputUndefined(CCDIncomeType.COUNCIL_TAX_SUPPORT),
      setUpRecurringOutputUndefined(CCDIncomeType.PENSION),
      undefined,
    ];
    //When
    const output = toCCDRecurringIncomeField(input, ResponseType.FULL_ADMISSION);
    //Then
    expect(output).toEqual(expected);
  });
  it('should return undefined if all values content are undefined', () => {
    //Given
    const incomeParams : IncomeParams = {
      job: setUpTransactionInputContentUndefined(),
      universalCredit: setUpTransactionInputContentUndefined(),
      jobseekerAllowanceIncome: setUpTransactionInputContentUndefined(),
      jobseekerAllowanceContribution: setUpTransactionInputContentUndefined(),
      incomeSupport: setUpTransactionInputContentUndefined(),
      workingTaxCredit: setUpTransactionInputContentUndefined(),
      childTaxCredit: setUpTransactionInputContentUndefined(),
      childBenefit: setUpTransactionInputContentUndefined(),
      councilTaxSupport: setUpTransactionInputContentUndefined(),
      pension: setUpTransactionInputContentUndefined(),
      other: setUpOtherTransactionInputContentUndefined(),
    };
    const input = new Claim();
    input.respondent1 = {
      responseType: ResponseType.FULL_ADMISSION,
    };
    input.statementOfMeans = new StatementOfMeans();
    input.statementOfMeans.regularIncome = new RegularIncome(incomeParams);
    const expected : CCDRecurringIncome[] = [
      setUpRecurringOutputUndefined(CCDIncomeType.JOB),
      setUpRecurringOutputUndefined(CCDIncomeType.UNIVERSAL_CREDIT),
      setUpRecurringOutputUndefined(CCDIncomeType.JOBSEEKER_ALLOWANCE_INCOME),
      setUpRecurringOutputUndefined(CCDIncomeType.JOBSEEKER_ALLOWANCE_CONTRIBUTION),
      setUpRecurringOutputUndefined(CCDIncomeType.INCOME_SUPPORT),
      setUpRecurringOutputUndefined(CCDIncomeType.WORKING_TAX_CREDIT),
      setUpRecurringOutputUndefined(CCDIncomeType.CHILD_TAX),
      setUpRecurringOutputUndefined(CCDIncomeType.CHILD_BENEFIT),
      setUpRecurringOutputUndefined(CCDIncomeType.COUNCIL_TAX_SUPPORT),
      setUpRecurringOutputUndefined(CCDIncomeType.PENSION),
      setUpOtherRecurringOutputUndefined(CCDIncomeType.OTHER),
    ];
    //When
    const output = toCCDRecurringIncomeField(input, ResponseType.FULL_ADMISSION);
    //Then
    expect(output).toEqual(expected);
  });
});

const setUpTransactionInput = (declared : boolean): Transaction => {
  const transactionSourceParams : TransactionSourceParams = {
    isIncome: true,
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
    isIncome: true,
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

const setUpTransactionInputContentUndefined = (): Transaction => {
  const transactionSourceParams : TransactionSourceParams = {
    isIncome: true,
    nameRequired: true,
    name: 'test',
    amount: undefined,
    schedule: undefined,
  };
  const transactionSource = new TransactionSource(transactionSourceParams);
  const transaction = new Transaction(true, transactionSource);

  return transaction;
};

const setUpOtherTransactionInputUndefined = (): OtherTransaction => {
  const otherTransaction = new OtherTransaction(true, undefined);

  return otherTransaction;
};

const setUpOtherTransactionInputContentUndefined = (): OtherTransaction => {
  const transactionSourceParams : TransactionSourceParams = {
    isIncome: true,
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

const setUpRecurringOutput = (type: CCDIncomeType, frequency :CCDPaymentFrequency): CCDRecurringIncome => {
  return {
    value: {
      type: type,
      typeOtherDetails: undefined,
      amount: Number(100),
      frequency: frequency,
    },
  };
};

const setUpOtherRecurringOutput = (type: CCDIncomeType, frequency :CCDPaymentFrequency): CCDRecurringIncome => {
  return {
    value: {
      type: type,
      typeOtherDetails: 'test',
      amount: Number(100),
      frequency: frequency,
    },
  };
};

const setUpRecurringOutputUndefined = (type: CCDIncomeType): CCDRecurringIncome => {
  return {
    value: {
      type: type,
      amount: undefined,
      frequency: undefined,
    },
  };
};

const setUpOtherRecurringOutputUndefined = (type: CCDIncomeType): CCDRecurringIncome => {
  return {
    value: {
      type: type,
      typeOtherDetails: undefined,
      amount: undefined,
      frequency: undefined,
    },
  };
};
