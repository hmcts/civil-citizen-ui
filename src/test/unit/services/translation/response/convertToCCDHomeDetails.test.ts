import {toCCDHomeDetails} from 'services/translation/response/convertToCCDHomeDetails';

import {CCDHomeDetails, CCDHomeType} from 'models/ccdResponse/ccdHomeDetails';
import {Residence} from 'form/models/statementOfMeans/residence/residence';
import {ResidenceType} from 'form/models/statementOfMeans/residence/residenceType';

describe('translate Home Details to CCD model', () => {

  it('should return undefined if it is undefined', () => {
    //Given
    //When
    const output = toCCDHomeDetails(undefined);
    const expected: CCDHomeDetails = {
      type: undefined,
      typeOtherDetails: undefined,
    };
    //Then
    expect(output).toEqual(expected);
  });

  it('should return undefined if input is undefined', () => {
    //Given
    const input = new Residence(undefined, undefined);
    const expected: CCDHomeDetails = {
      type: undefined,
      typeOtherDetails: undefined,
    };
    //When
    const output = toCCDHomeDetails(input);
    //Then
    expect(output).toEqual(expected);
  });

  it('should return owned home', () => {
    //Given
    const input = new Residence(ResidenceType.OWN_HOME, undefined);
    const expected: CCDHomeDetails = {
      type: CCDHomeType.OWNED_HOME,
      typeOtherDetails: undefined,
    };
    //When
    const output = toCCDHomeDetails(input);
    //Then
    expect(output).toEqual(expected);
  });

  it('should return join owned home', () => {
    //Given
    const input = new Residence(ResidenceType.JOINT_OWN_HOME, undefined);
    const expected: CCDHomeDetails = {
      type: CCDHomeType.JOINTLY_OWNED_HOME,
      typeOtherDetails: undefined,
    };
    //When
    const output = toCCDHomeDetails(input);
    //Then
    expect(output).toEqual(expected);
  });

  it('should return private rental', () => {
    //Given
    const input = new Residence(ResidenceType.PRIVATE_RENTAL, undefined);
    const expected: CCDHomeDetails = {
      type: CCDHomeType.PRIVATE_RENTAL,
      typeOtherDetails: undefined,
    };
    //When
    const output = toCCDHomeDetails(input);
    //Then
    expect(output).toEqual(expected);
  });

  it('should return associate home', () => {
    //Given
    const input = new Residence(ResidenceType.COUNCIL_OR_HOUSING_ASSN_HOME, undefined);
    const expected: CCDHomeDetails = {
      type: CCDHomeType.ASSOCIATION_HOME,
      typeOtherDetails: undefined,
    };
    //When
    const output = toCCDHomeDetails(input);
    //Then
    expect(output).toEqual(expected);
  });

  it('should return others with details', () => {
    //Given
    const input = new Residence(ResidenceType.OTHER, 'test');
    const expected: CCDHomeDetails = {
      type: CCDHomeType.OTHER,
      typeOtherDetails: 'test',
    };
    //When
    const output = toCCDHomeDetails(input);
    //Then
    expect(output).toEqual(expected);
  });
});
