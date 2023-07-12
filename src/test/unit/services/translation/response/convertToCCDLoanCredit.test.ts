import {toCCDLoanCredit} from 'services/translation/response/convertToCCDLoanCredit';
import {DebtItems} from 'form/models/statementOfMeans/debts/debtItems';
import {CCDLoanCredit} from 'models/ccdResponse/ccdLoanCredit';

describe('translate loan credit to CCD model', () => {
  it('should return undefined if it is undefined', () => {
    //Given
    //When
    const output = toCCDLoanCredit(undefined);
    //Then
    expect(output).toEqual(undefined);
  });

  it('should return undefined if it is empty', () => {
    //Given
    const input : DebtItems[] = [];
    //When
    const output = toCCDLoanCredit(input);
    //Then
    expect(output).toEqual(undefined);
  });

  it('should return values if there is input', () => {
    //Given
    const input : DebtItems[] = [
      new DebtItems('test', '1','1'),
    ];
    const expected : CCDLoanCredit[] = [{
      value: {
        loanCardDebtDetail: 'test',
        totalOwed: Number('100'),
        monthlyPayment: Number('100'),
      },
    }];
    //When
    const output = toCCDLoanCredit(input);
    //Then
    expect(output).toEqual(expected);
  });

  it('should return values if there is input undefined', () => {
    //Given
    const input : DebtItems[] = [
      new DebtItems(undefined, undefined,undefined),
    ];
    const expected : CCDLoanCredit[] = [{
      value: {
        loanCardDebtDetail: undefined,
        totalOwed: undefined,
        monthlyPayment: undefined,
      },
    }];
    //When
    const output = toCCDLoanCredit(input);
    //Then
    expect(output).toEqual(expected);
  });
});
