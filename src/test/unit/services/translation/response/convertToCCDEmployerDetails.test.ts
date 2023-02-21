import {toCCDEmploymentDetails} from 'services/translation/response/convertToCCDEmployerDetails';
import {Employers} from 'form/models/statementOfMeans/employment/employers';
import {CCDEmployerDetails} from 'models/ccdResponse/ccdEmployerDetails';

describe('translate employer details to CCD model', () => {
  it('should return undefined if it is undefined', () => {
    //Given
    const input : Employers = undefined;
    //When
    const output = toCCDEmploymentDetails(input);
    //Then
    expect(output).toEqual(undefined);
  });

  it('should return empty if it is empty', () => {
    //Given
    const input : Employers = {
      rows: [],
    };

    const expected : CCDEmployerDetails = {
      employerDetails: [],
    };
    //When
    const output = toCCDEmploymentDetails(input);
    //Then
    expect(output).toEqual(expected);
  });

  it('should return value if there is input', () => {
    //Given
    const input : Employers = {
      rows: [
        {
          employerName: 'test',
          jobTitle: 'job',
        },
      ],
    };

    const expected : CCDEmployerDetails = {
      employerDetails: [{
        value: {
          employerName: 'test',
          jobTitle: 'job',
        },
      }],
    };
    //When
    const output = toCCDEmploymentDetails(input);
    //Then
    expect(output).toEqual(expected);
  });
});
