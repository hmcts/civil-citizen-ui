import {toCUIEmploymentDetails} from 'services/translation/convertToCUI/convertToCUIEmployerDetails';
import {CCDEmployerDetails} from 'models/ccdResponse/ccdEmployerDetails';
import {Employers} from 'form/models/statementOfMeans/employment/employers';

describe('translate Employer Details to CUI model', () => {
  it('should return undefined if Employment Details doesnt exist', () => {
    //Given
    //When
    const output = toCUIEmploymentDetails(undefined);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return data if Employment Details exist', () => {
    //Given
    const input : CCDEmployerDetails = {
      employerDetails: [{
        value: {
          employerName: 'test',
          jobTitle: 'job',
        },
      }],
    };
    //When
    const output = toCUIEmploymentDetails(input);
    //Then
    const expected : Employers = {
      rows: [{
        employerName: 'test',
        jobTitle: 'job',
      }],
    };
    expect(output).toEqual(expected);
  });

  it('should return data if Employment Details value undefined', () => {
    //Given
    const input : CCDEmployerDetails = {
      employerDetails: [{
        value: {
          employerName: undefined,
          jobTitle: undefined,
        },
      }],
    };
    //When
    const output = toCUIEmploymentDetails(input);
    //Then
    const expected : Employers = {
      rows: [{
        employerName: undefined,
        jobTitle: undefined,
      }],
    };
    expect(output).toEqual(expected);
  });

  it('should return data if Employment Details data undefined', () => {
    //Given
    const input : CCDEmployerDetails = {
      employerDetails: [{
        value: undefined,
      }],
    };
    //When
    const output = toCUIEmploymentDetails(input);
    //Then
    const expected : Employers = {
      rows: [{
        employerName: undefined,
        jobTitle: undefined,
      }],
    };
    expect(output).toEqual(expected);
  });

  it('should return data if Employment Details undefined', () => {
    //Given
    const input : CCDEmployerDetails = {
      employerDetails: undefined,
    };
    //When
    const output = toCUIEmploymentDetails(input);
    //Then
    expect(output).toEqual(undefined);
  });
});
