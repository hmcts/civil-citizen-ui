import {toCCDLoanCredit} from 'services/translation/response/convertToCCDLoanCredit';
import {DebtItems} from 'form/models/statementOfMeans/debts/debtItems';
import {CCDLoanCredit} from 'models/ccdResponse/ccdLoanCredit';

describe('translate loan credit to CCD model', () => {
  it('should return undefined if it is undefined', () => {
    const output = toCCDLoanCredit(undefined);
    expect(output).toEqual(undefined);
  });

  it('should return undefined if it is empty', () => {
    const input : DebtItems[] = [];

    const output = toCCDLoanCredit(input);
    expect(output).toEqual(undefined);
  });

  it('should return values if there is input', () => {
    const input : DebtItems[] = [
      new DebtItems('test', '1','1'),
    ];
    const expected : CCDLoanCredit[] = [{
      value: {
        loanCardDebtDetail: 'test',
        totalOwed: Number('1'),
        monthlyPayment: Number('1'),
      },
    }];

    const output = toCCDLoanCredit(input);
    expect(output).toEqual(expected);
  });

  it('should return values if there is input undefined', () => {
    const input : DebtItems[] = [
      new DebtItems(undefined, undefined,undefined),
    ];
    const expected : CCDLoanCredit[] = [{
      value: {
        loanCardDebtDetail: undefined,
        totalOwed: NaN,
        monthlyPayment: NaN,
      },
    }];

    const output = toCCDLoanCredit(input);
    expect(output).toEqual(expected);
  });
});
