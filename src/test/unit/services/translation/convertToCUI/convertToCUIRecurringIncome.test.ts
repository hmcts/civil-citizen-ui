import {toCUIRecurringIncome} from 'services/translation/convertToCUI/convertToCUIRecurringIncome';
import {CCDIncomeType, CCDRecurringIncome, CCDRecurringIncomeItem} from 'models/ccdResponse/ccdRecurringIncome';
import {CCDPaymentFrequency} from 'models/ccdResponse/ccdPaymentFrequency';
import {TransactionSource} from 'form/models/statementOfMeans/expensesAndIncome/transactionSource';
import {TransactionSchedule} from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {RegularIncome} from 'form/models/statementOfMeans/expensesAndIncome/regularIncome';
import {Transaction} from 'form/models/statementOfMeans/expensesAndIncome/transaction';
import {IncomeType} from 'form/models/statementOfMeans/expensesAndIncome/incomeType';
import {OtherTransaction} from 'form/models/statementOfMeans/expensesAndIncome/otherTransaction';

describe('translate Recurring Income to CUI model', () => {
  it('should return undefined if Recurring Income doesnt exist', () => {
    //Given
    //When
    const output = toCUIRecurringIncome(undefined);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return undefined if Recurring Income details empty', () => {
    //Given
    const input : CCDRecurringIncome[] = [];
    //When
    const output = toCUIRecurringIncome(input);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return data if Recurring Income details data exist', () => {
    //Given
    const input : CCDRecurringIncome[] = [
      { value : setUpCcdRecurringIncome(CCDIncomeType.JOB)},
      { value : setUpCcdRecurringIncome(CCDIncomeType.UNIVERSAL_CREDIT)},
      { value : setUpCcdRecurringIncome(CCDIncomeType.JOBSEEKER_ALLOWANCE_INCOME)},
      { value : setUpCcdRecurringIncome(CCDIncomeType.JOBSEEKER_ALLOWANCE_CONTRIBUTION)},
      { value : setUpCcdRecurringIncome(CCDIncomeType.INCOME_SUPPORT)},
      { value : setUpCcdRecurringIncome(CCDIncomeType.WORKING_TAX_CREDIT)},
      { value : setUpCcdRecurringIncome(CCDIncomeType.CHILD_TAX)},
      { value : setUpCcdRecurringIncome(CCDIncomeType.CHILD_BENEFIT)},
      { value : setUpCcdRecurringIncome(CCDIncomeType.COUNCIL_TAX_SUPPORT)},
      { value : setUpCcdRecurringIncome(CCDIncomeType.PENSION)},
      { value : setUpCcdRecurringOtherIncome(CCDIncomeType.OTHER)},
    ];
    //When
    const output = toCUIRecurringIncome(input);
    //Then
    const expected : RegularIncome = {
      job: new Transaction(true, setUpTransactionSource(IncomeType.JOB)),
      universalCredit: new Transaction(true, setUpTransactionSource(IncomeType.UNIVERSAL_CREDIT)),
      jobseekerAllowanceIncome: new Transaction(true, setUpTransactionSource(IncomeType.JOB_SEEKERS_ALLOWANCE_INCOME_BASED)),
      jobseekerAllowanceContribution: new Transaction(true, setUpTransactionSource(IncomeType.JOB_SEEKERS_ALLOWANCE_CONTRIBUTION_BASED)),
      incomeSupport: new Transaction(true, setUpTransactionSource(IncomeType.INCOME_SUPPORT)),
      workingTaxCredit: new Transaction(true, setUpTransactionSource(IncomeType.WORKING_TAX_CREDIT)),
      childTaxCredit: new Transaction(true, setUpTransactionSource(IncomeType.CHILD_TAX_CREDIT)),
      childBenefit: new Transaction(true, setUpTransactionSource(IncomeType.CHILD_BENEFIT)),
      councilTaxSupport: new Transaction(true, setUpTransactionSource(IncomeType.COUNCIL_TAX_SUPPORT)),
      pension: new Transaction(true, setUpTransactionSource(IncomeType.PENSION)),
      other: new OtherTransaction(true, [setUpTransactionSourceOther(IncomeType.OTHER)]),
    };
    expect(output).toEqual(expected);
  });

  it('should return data if Recurring Income details data undefined', () => {
    //Given
    const input : CCDRecurringIncome[] = [
      { value : setUpCcdRecurringIncomeUndefined()},
    ];
    //When
    const output = toCUIRecurringIncome(input);
    //Then
    const expected : RegularIncome = {
      job: new Transaction(undefined, setUpTransactionSourceUndefined(IncomeType.JOB)),
      universalCredit: new Transaction(undefined, setUpTransactionSourceUndefined(IncomeType.UNIVERSAL_CREDIT)),
      jobseekerAllowanceIncome: new Transaction(undefined, setUpTransactionSourceUndefined(IncomeType.JOB_SEEKERS_ALLOWANCE_INCOME_BASED)),
      jobseekerAllowanceContribution: new Transaction(undefined, setUpTransactionSourceUndefined(IncomeType.JOB_SEEKERS_ALLOWANCE_CONTRIBUTION_BASED)),
      incomeSupport: new Transaction(undefined, setUpTransactionSourceUndefined(IncomeType.INCOME_SUPPORT)),
      workingTaxCredit: new Transaction(undefined, setUpTransactionSourceUndefined(IncomeType.WORKING_TAX_CREDIT)),
      childTaxCredit: new Transaction(undefined, setUpTransactionSourceUndefined(IncomeType.CHILD_TAX_CREDIT)),
      childBenefit: new Transaction(undefined, setUpTransactionSourceUndefined(IncomeType.CHILD_BENEFIT)),
      councilTaxSupport: new Transaction(undefined, setUpTransactionSourceUndefined(IncomeType.COUNCIL_TAX_SUPPORT)),
      pension: new Transaction(undefined, setUpTransactionSourceUndefined(IncomeType.PENSION)),
      other: new OtherTransaction(false, [setUpTransactionSourceOtherUndefined(IncomeType.OTHER)]),
    };
    expect(output).toEqual(expected);
  });
});

const setUpCcdRecurringIncome = (incomeType : CCDIncomeType) : CCDRecurringIncomeItem => {
  return {
    type: incomeType,
    typeOtherDetails: undefined,
    amount: 100,
    frequency: CCDPaymentFrequency.ONCE_ONE_WEEK,
  };
};

const setUpCcdRecurringOtherIncome = (incomeType : CCDIncomeType) : CCDRecurringIncomeItem => {
  return {
    type: incomeType,
    typeOtherDetails: 'test',
    amount: 100,
    frequency: CCDPaymentFrequency.ONCE_ONE_WEEK,
  };
};

const setUpCcdRecurringIncomeUndefined = () : CCDRecurringIncomeItem => {
  return {
    type: undefined,
    typeOtherDetails: undefined,
    amount: undefined,
    frequency: undefined,
  };
};

const setUpTransactionSource = (incomeType : IncomeType) : TransactionSource => {
  return new TransactionSource(
    {
      name : incomeType,
      amount : 100,
      schedule : TransactionSchedule.WEEK,
      isIncome : true,
      nameRequired : undefined,
    },
  );
};

const setUpTransactionSourceOther = (incomeType : IncomeType) : TransactionSource => {
  return new TransactionSource(
    {
      name : 'test',
      amount : 100,
      schedule : TransactionSchedule.WEEK,
      isIncome : true,
      nameRequired : true,
    },
  );
};

const setUpTransactionSourceUndefined = (incomeType : IncomeType) : TransactionSource => {
  return new TransactionSource(
    {
      name : incomeType,
      amount : undefined,
      schedule : undefined,
      isIncome : true,
      nameRequired : undefined,
    },
  );
};

const setUpTransactionSourceOtherUndefined = (incomeType : IncomeType) : TransactionSource => {
  return new TransactionSource(
    {
      name : undefined,
      amount : undefined,
      schedule : undefined,
      isIncome : true,
      nameRequired : undefined,
    },
  );
};
