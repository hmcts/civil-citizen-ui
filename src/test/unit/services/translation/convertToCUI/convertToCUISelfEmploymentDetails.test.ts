import {toCUISelfEmploymentDetails} from 'services/translation/convertToCUI/convertToCUISelfEmploymentDetails';
import {CCDSelfEmploymentDetails} from 'models/ccdResponse/ccdSelfEmploymentDetails';
import {SelfEmployedAs} from 'models/selfEmployedAs';

describe('translate Self Employment Details to CUI model', () => {
  it('should return undefined if Self Employment Details doesnt exist', () => {
    //Given
    //When
    const output = toCUISelfEmploymentDetails(undefined);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return data if Self Employment Details exist', () => {
    //Given
    const input : CCDSelfEmploymentDetails = {
      jobTitle: 'test',
      annualTurnover: 10000,
    };
    //When
    const output = toCUISelfEmploymentDetails(input);
    //Then
    const expected : SelfEmployedAs = {
      jobTitle: 'test',
      annualTurnover: 100,
    };
    expect(output).toEqual(expected);
  });

  it('should return undefined if Self Employment undefined exist', () => {
    //Given
    const input : CCDSelfEmploymentDetails = {
      jobTitle: undefined,
      annualTurnover: undefined,
    };
    //When
    const output = toCUISelfEmploymentDetails(input);
    //Then
    const expected : SelfEmployedAs = {
      jobTitle: undefined,
      annualTurnover: undefined,
    };
    expect(output).toEqual(expected);
  });
});
