import {toCCDEmploymentDetails} from 'services/translation/response/convertToCCDEmployerDetails';
import {Employers} from 'form/models/statementOfMeans/employment/employers';
import {CCDEmployerDetails} from 'models/ccdResponse/ccdEmployerDetails';

describe('translate employer details to CCD model', () => {
  it('should return undefined if it is undefined', () => {
    const input : Employers = undefined;

    const output = toCCDEmploymentDetails(input);
    expect(output).toEqual(undefined);
  });

  it('should return empty if it is empty', () => {
    const input : Employers = {
      rows: [],
    };

    const expected : CCDEmployerDetails = {
      employerDetails: [],
    };
    const output = toCCDEmploymentDetails(input);
    expect(output).toEqual(expected);
  });

  it('should return value if there is input', () => {
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

    const output = toCCDEmploymentDetails(input);
    expect(output).toEqual(expected);
  });
});
