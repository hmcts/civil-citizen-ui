import {toCUIUnemploymentDetails} from 'services/translation/convertToCUI/convertToCUIUnemploymentDetails';
import {CCDUnemploymentDetails, CCDUnemploymentType} from 'models/ccdResponse/ccdUnemploymentDetails';
import {Unemployment} from 'form/models/statementOfMeans/unemployment/unemployment';
import {UnemploymentCategory} from 'form/models/statementOfMeans/unemployment/unemploymentCategory';
import {UnemploymentDetails} from 'form/models/statementOfMeans/unemployment/unemploymentDetails';
import {OtherDetails} from 'form/models/statementOfMeans/unemployment/otherDetails';

describe('translate Unemployment Details to CUI model', () => {
  it('should return undefined if Unemployment Details doesnt exist', () => {
    //Given
    //When
    const output = toCUIUnemploymentDetails(undefined);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return data if Unemployment Details exist with unemployment', () => {
    //Given
    const input : CCDUnemploymentDetails = {
      unemployedComplexTypeRequired: CCDUnemploymentType.UNEMPLOYED,
      lengthOfUnemployment: {
        numberOfYearsInUnemployment: 1,
        numberOfMonthsInUnemployment: 1,
      },
      otherUnemployment: undefined,
    };
    //When
    const output = toCUIUnemploymentDetails(input);
    //Then
    const expected  = new Unemployment(UnemploymentCategory.UNEMPLOYED, new UnemploymentDetails('1', '1'), undefined);
    expect(output).toEqual(expected);
  });

  it('should return data if Unemployment Details exist with retired', () => {
    //Given
    const input : CCDUnemploymentDetails = {
      unemployedComplexTypeRequired: CCDUnemploymentType.RETIRED,
      lengthOfUnemployment: undefined,
      otherUnemployment: undefined,
    };
    //When
    const output = toCUIUnemploymentDetails(input);
    //Then
    const expected  = new Unemployment(UnemploymentCategory.RETIRED, undefined, undefined);
    expect(output).toEqual(expected);
  });

  it('should return data if Unemployment Details exist with other', () => {
    //Given
    const input : CCDUnemploymentDetails = {
      unemployedComplexTypeRequired: CCDUnemploymentType.OTHER,
      lengthOfUnemployment: undefined,
      otherUnemployment: 'test',
    };
    //When
    const output = toCUIUnemploymentDetails(input);
    //Then
    const expected  = new Unemployment(UnemploymentCategory.OTHER, undefined, new OtherDetails('test'));
    expect(output).toEqual(expected);
  });

  it('should return undefined if Unemployment Details undefined', () => {
    //Given
    const input : CCDUnemploymentDetails = {
      unemployedComplexTypeRequired: undefined,
      lengthOfUnemployment: {
        numberOfYearsInUnemployment: undefined,
        numberOfMonthsInUnemployment: undefined,
      },
      otherUnemployment: undefined,
    };
    //When
    const output = toCUIUnemploymentDetails(input);
    //Then
    const expected  = new Unemployment(undefined, new UnemploymentDetails(undefined, undefined), undefined);
    expect(output).toEqual(expected);
  });
});
