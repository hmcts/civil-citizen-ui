import {toCCDSelfEmploymentDetails} from 'services/translation/response/convertToCCDSelfEmploymentDetails';
import {CCDSelfEmploymentDetails} from 'models/ccdResponse/ccdSelfEmploymentDetails';
import {StatementOfMeans} from 'models/statementOfMeans';
import {YesNoUpperCamelCase} from 'form/models/yesNo';

describe('translate self employment details to CCD model', () => {
  it('should return values if it is undefined', () => {
    //Given
    const expected: CCDSelfEmploymentDetails = setUpUndefinedOutput();
    //When
    const output = toCCDSelfEmploymentDetails(undefined);
    //Then
    expect(output).toEqual(expected);
  });

  it('should return values if there is empty', () => {
    //Given
    const expected: CCDSelfEmploymentDetails = setUpUndefinedOutput();
    //When
    const output = toCCDSelfEmploymentDetails(new StatementOfMeans());
    //Then
    expect(output).toEqual(expected);
  });

  it('should return values if there is input', () => {
    //Given
    const input = new StatementOfMeans();
    input.selfEmployedAs = {
      jobTitle: 'test',
      annualTurnover: Number(1),
    };
    input.taxPayments = {
      owed: true,
      amountOwed: Number(2),
      reason: 'test',
    };

    const expected: CCDSelfEmploymentDetails = {
      jobTitle: 'test',
      annualTurnover: Number(100),
      isBehindOnTaxPayment: YesNoUpperCamelCase.YES,
      amountOwed: Number(200),
      reason: 'test',
    };
    //When
    const output = toCCDSelfEmploymentDetails(input);
    //Then
    expect(output).toEqual(expected);
  });

  it('should return values if there is input with tax is no', () => {
    //Given
    const input = new StatementOfMeans();
    input.selfEmployedAs = {
      jobTitle: 'test',
      annualTurnover: Number(1),
    };
    input.taxPayments = {
      owed: false,
      amountOwed: undefined,
      reason: undefined,
    };

    const expected: CCDSelfEmploymentDetails = {
      jobTitle: 'test',
      annualTurnover: Number(100),
      isBehindOnTaxPayment: YesNoUpperCamelCase.NO,
      amountOwed: undefined,
      reason: undefined,
    };
    //When
    const output = toCCDSelfEmploymentDetails(input);
    //Then
    expect(output).toEqual(expected);
  });
});

const setUpUndefinedOutput = () : CCDSelfEmploymentDetails => {
  return {
    jobTitle: undefined,
    annualTurnover: undefined,
    isBehindOnTaxPayment: undefined,
    amountOwed: undefined,
    reason: undefined,
  };
};
