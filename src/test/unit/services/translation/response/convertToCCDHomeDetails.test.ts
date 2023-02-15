import {toCCDHomeDetails} from 'services/translation/response/convertToCCDHomeDetails';

import {CCDHomeDetails, CCDHomeType} from 'models/ccdResponse/ccdHomeDetails';
import {Residence} from 'form/models/statementOfMeans/residence/residence';
import {ResidenceType} from 'form/models/statementOfMeans/residence/residenceType';

describe('translate Home Details to CCD model', () => {

  it('should return undefined if it is undefined', () => {
    //input
    const output = toCCDHomeDetails(undefined);
    const expected: CCDHomeDetails = {
      type: undefined,
      typeOtherDetails: undefined,
    };
    //output
    expect(output).toEqual(expected);
  });

  it('should return undefined if input is undefined', () => {
    //input
    const input = new Residence(undefined, undefined);
    const output = toCCDHomeDetails(input);
    const expected: CCDHomeDetails = {
      type: undefined,
      typeOtherDetails: undefined,
    };
    //output
    expect(output).toEqual(expected);
  });

  it('should return owned home', () => {
    //input
    const input = new Residence(ResidenceType.OWN_HOME, undefined);
    const output = toCCDHomeDetails(input);
    const expected: CCDHomeDetails = {
      type: CCDHomeType.OWNED_HOME,
      typeOtherDetails: undefined,
    };
    //output
    expect(output).toEqual(expected);
  });

  it('should return join owned home', () => {
    //input
    const input = new Residence(ResidenceType.JOINT_OWN_HOME, undefined);
    const output = toCCDHomeDetails(input);
    const expected: CCDHomeDetails = {
      type: CCDHomeType.JOINTLY_OWNED_HOME,
      typeOtherDetails: undefined,
    };
    //output
    expect(output).toEqual(expected);
  });

  it('should return private rental', () => {
    //input
    const input = new Residence(ResidenceType.PRIVATE_RENTAL, undefined);
    const output = toCCDHomeDetails(input);
    const expected: CCDHomeDetails = {
      type: CCDHomeType.PRIVATE_RENTAL,
      typeOtherDetails: undefined,
    };
    //output
    expect(output).toEqual(expected);
  });

  it('should return associate home', () => {
    //input
    const input = new Residence(ResidenceType.COUNCIL_OR_HOUSING_ASSN_HOME, undefined);
    const output = toCCDHomeDetails(input);
    const expected: CCDHomeDetails = {
      type: CCDHomeType.ASSOCIATION_HOME,
      typeOtherDetails: undefined,
    };
    //output
    expect(output).toEqual(expected);
  });

  it('should return others with details', () => {
    //input
    const input = new Residence(ResidenceType.OTHER, 'test');
    const output = toCCDHomeDetails(input);
    const expected: CCDHomeDetails = {
      type: CCDHomeType.OTHER,
      typeOtherDetails: 'test',
    };
    //output
    expect(output).toEqual(expected);
  });
});
