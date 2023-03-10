import {toCCDUnemploymentDetails} from 'services/translation/response/convertToCCDUnemploymentDetails';
import {Unemployment} from 'form/models/statementOfMeans/unemployment/unemployment';
import {CCDUnemploymentDetails, CCDUnemploymentType} from 'models/ccdResponse/ccdUnemploymentDetails';
import {UnemploymentCategory} from 'form/models/statementOfMeans/unemployment/unemploymentCategory';

describe('translate unemployment to CCD model', () => {
  it('should return undefined if it is empty', () => {
    //Given
    const expected: CCDUnemploymentDetails = {
      unemployedComplexTypeRequired: undefined,
      lengthOfUnemployment: undefined,
      otherUnemployment: undefined,
    };
    //When
    const output = toCCDUnemploymentDetails(new Unemployment());
    //Then
    expect(output).toEqual(expected);
  });

  it('should return undefined if it is undefined', () => {
    //Given
    const expected: CCDUnemploymentDetails = {
      unemployedComplexTypeRequired: undefined,
      lengthOfUnemployment: undefined,
      otherUnemployment: undefined,
    };
    //When
    const output = toCCDUnemploymentDetails(undefined);
    //Then
    expect(output).toEqual(expected);
  });

  it('should return value if it is retired', () => {
    //Given
    const input = new Unemployment();
    input.option = UnemploymentCategory.RETIRED;
    const expected: CCDUnemploymentDetails = {
      unemployedComplexTypeRequired: CCDUnemploymentType.RETIRED,
      lengthOfUnemployment: undefined,
      otherUnemployment: undefined,
    };
    //When
    const output = toCCDUnemploymentDetails(input);
    //Then
    expect(output).toEqual(expected);
  });

  it('should return value if it is other', () => {
    //Given
    const input = new Unemployment();
    input.option = UnemploymentCategory.OTHER;
    input.otherDetails = {
      details : 'test',
    };
    const expected: CCDUnemploymentDetails = {
      unemployedComplexTypeRequired: CCDUnemploymentType.OTHER,
      lengthOfUnemployment: undefined,
      otherUnemployment: 'test',
    };
    //When
    const output = toCCDUnemploymentDetails(input);
    //Then
    expect(output).toEqual(expected);
  });

  it('should return value if it is unemployed', () => {
    //Given
    const input = new Unemployment();
    input.option = UnemploymentCategory.UNEMPLOYED;
    input.unemploymentDetails = {
      years: Number(1),
      months: Number(1),
    };
    const expected: CCDUnemploymentDetails = {
      unemployedComplexTypeRequired: CCDUnemploymentType.UNEMPLOYED,
      lengthOfUnemployment: {
        numberOfYearsInUnemployment: Number(1),
        numberOfMonthsInUnemployment: Number(1),
      },
      otherUnemployment: undefined,
    };
    //When
    const output = toCCDUnemploymentDetails(input);
    //Then
    expect(output).toEqual(expected);
  });

  it('should return undefined if all input is undefined', () => {
    //Given
    const input = new Unemployment();
    input.option = undefined;
    input.unemploymentDetails = {
      years: undefined,
      months: undefined,
    };
    input.otherDetails = {
      details : undefined,
    };
    const expected: CCDUnemploymentDetails = {
      unemployedComplexTypeRequired: undefined,
      lengthOfUnemployment: {
        numberOfYearsInUnemployment: undefined,
        numberOfMonthsInUnemployment: undefined,
      },
      otherUnemployment: undefined,
    };
    //When
    const output = toCCDUnemploymentDetails(input);
    //Then
    expect(output).toEqual(expected);
  });
});
