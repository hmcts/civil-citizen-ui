import {toCCDUnemploymentDetails} from "services/translation/response/convertToCCDUnemploymentDetails";
import {Unemployment} from "form/models/statementOfMeans/unemployment/unemployment";
import {CCDUnemploymentDetails, CCDUnemploymentType} from "models/ccdResponse/ccdUnemploymentDetails";
import {UnemploymentCategory} from "form/models/statementOfMeans/unemployment/unemploymentCategory";

describe('translate unemployment to CCD model', () => {
  it('should return undefined if it is empty', () => {
    //output
    const expected: CCDUnemploymentDetails = {
      unemployedComplexTypeRequired: undefined,
      lengthOfUnemployment: undefined,
      otherUnemployment: undefined,
    }

    const output = toCCDUnemploymentDetails(new Unemployment());
    expect(output).toEqual(expected);
  });

  it('should return undefined if it is undefined', () => {
    //output
    const expected: CCDUnemploymentDetails = {
      unemployedComplexTypeRequired: undefined,
      lengthOfUnemployment: undefined,
      otherUnemployment: undefined,
    }

    const output = toCCDUnemploymentDetails(undefined);
    expect(output).toEqual(expected);
  });

  it('should return value if it is retired', () => {
    //input
    const input = new Unemployment();
    input.option = UnemploymentCategory.RETIRED
    //output
    const expected: CCDUnemploymentDetails = {
      unemployedComplexTypeRequired: CCDUnemploymentType.RETIRED,
      lengthOfUnemployment: undefined,
      otherUnemployment: undefined,
    }

    const output = toCCDUnemploymentDetails(input);
    expect(output).toEqual(expected);
  });

  it('should return value if it is other', () => {
    //input
    const input = new Unemployment();
    input.option = UnemploymentCategory.OTHER;
    input.otherDetails = {
      details : 'test'
    }
    //output
    const expected: CCDUnemploymentDetails = {
      unemployedComplexTypeRequired: CCDUnemploymentType.OTHER,
      lengthOfUnemployment: undefined,
      otherUnemployment: 'test',
    }

    const output = toCCDUnemploymentDetails(input);
    expect(output).toEqual(expected);
  });

  it('should return value if it is unemployed', () => {
    //input
    const input = new Unemployment();
    input.option = UnemploymentCategory.UNEMPLOYED;
    input.unemploymentDetails = {
      years: Number(1),
      months: Number(1)
    }
    //output
    const expected: CCDUnemploymentDetails = {
      unemployedComplexTypeRequired: CCDUnemploymentType.UNEMPLOYED,
      lengthOfUnemployment: {
        numberOfYearsInUnemployment: Number(1),
        numberOfMonthsInUnemployment: Number(1)
      },
      otherUnemployment: undefined,
    }

    const output = toCCDUnemploymentDetails(input);
    expect(output).toEqual(expected);
  });

  it('should return undefined if all input is undefined', () => {
    //input
    const input = new Unemployment();
    input.option = undefined;
    input.unemploymentDetails = {
      years: undefined,
      months: undefined
    }
    input.otherDetails = {
      details : undefined
    }
    //output
    const expected: CCDUnemploymentDetails = {
      unemployedComplexTypeRequired: undefined,
      lengthOfUnemployment: {
        numberOfYearsInUnemployment: undefined,
        numberOfMonthsInUnemployment: undefined
      },
      otherUnemployment: undefined,
    }

    const output = toCCDUnemploymentDetails(input);
    expect(output).toEqual(expected);
  });
})
