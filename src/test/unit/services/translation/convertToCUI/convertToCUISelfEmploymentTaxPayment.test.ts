import {toCUISelfEmploymentTaxPayment} from 'services/translation/convertToCUI/convertToCUISelfEmploymentTaxPayment';
import {CCDSelfEmploymentDetails} from 'models/ccdResponse/ccdSelfEmploymentDetails';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {TaxPayments} from 'models/taxPayments';

describe('translate Self Employment Tax Payment to CUI model', () => {
  it('should return undefined if Self Employment Tax Payment doesnt exist', () => {
    //Given
    //When
    const output = toCUISelfEmploymentTaxPayment(undefined);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return data if Self Employment Tax Payment exist', () => {
    //Given
    const input : CCDSelfEmploymentDetails = {
      isBehindOnTaxPayment: YesNoUpperCamelCase.YES,
      amountOwed: 10000,
      reason: 'test',
    };
    //When
    const output = toCUISelfEmploymentTaxPayment(input);
    //Then
    const expected : TaxPayments = {
      owed: true,
      amountOwed: 100,
      reason: 'test',
    };
    expect(output).toEqual(expected);
  });

  it('should return data if Self Employment Tax Payment exist with No', () => {
    //Given
    const input : CCDSelfEmploymentDetails = {
      isBehindOnTaxPayment: YesNoUpperCamelCase.NO,
      amountOwed: undefined,
      reason: undefined,
    };
    //When
    const output = toCUISelfEmploymentTaxPayment(input);
    //Then
    const expected : TaxPayments = {
      owed: false,
      amountOwed: undefined,
      reason: undefined,
    };
    expect(output).toEqual(expected);
  });

  it('should return data if Self Employment Tax Payment exist with undefined', () => {
    //Given
    const input : CCDSelfEmploymentDetails = {
      isBehindOnTaxPayment: undefined,
      amountOwed: undefined,
      reason: undefined,
    };
    //When
    const output = toCUISelfEmploymentTaxPayment(input);
    //Then
    const expected : TaxPayments = {
      owed: undefined,
      amountOwed: undefined,
      reason: undefined,
    };
    expect(output).toEqual(expected);
  });
});
