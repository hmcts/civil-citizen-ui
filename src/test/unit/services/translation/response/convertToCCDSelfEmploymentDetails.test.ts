import {toCCDSelfEmploymentDetails} from 'services/translation/response/convertToCCDSelfEmploymentDetails';
import {CCDSelfEmploymentDetails} from 'models/ccdResponse/ccdSelfEmploymentDetails';
import {StatementOfMeans} from 'models/statementOfMeans';
import {YesNoUpperCamelCase} from 'form/models/yesNo';

describe('translate self employment details to CCD model', () => {
  it('should return values if it is undefined', () => {
    const expected: CCDSelfEmploymentDetails = {
      jobTitle: undefined,
      annualTurnover: undefined,
      isBehindOnTaxPayment: undefined,
      amountOwed: undefined,
      reason: undefined,
    };

    const output = toCCDSelfEmploymentDetails(undefined);
    expect(output).toEqual(expected);
  });

  it('should return values if there is empty', () => {
    const expected: CCDSelfEmploymentDetails = {
      jobTitle: undefined,
      annualTurnover: undefined,
      isBehindOnTaxPayment: undefined,
      amountOwed: undefined,
      reason: undefined,
    };

    const output = toCCDSelfEmploymentDetails(new StatementOfMeans());
    expect(output).toEqual(expected);
  });

  it('should return values if there is input', () => {
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
      annualTurnover: Number(1),
      isBehindOnTaxPayment: YesNoUpperCamelCase.YES,
      amountOwed: Number(2),
      reason: 'test',
    };

    const output = toCCDSelfEmploymentDetails(input);
    expect(output).toEqual(expected);
  });

  it('should return values if there is input with tax is no', () => {
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
      annualTurnover: Number(1),
      isBehindOnTaxPayment: YesNoUpperCamelCase.NO,
      amountOwed: undefined,
      reason: undefined,
    };

    const output = toCCDSelfEmploymentDetails(input);
    expect(output).toEqual(expected);
  });
});
