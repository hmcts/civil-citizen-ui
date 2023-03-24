import {toCUIHomeDetails} from 'services/translation/convertToCUI/convertToCUIHomeDetails';
import {CCDHomeDetails, CCDHomeType} from 'models/ccdResponse/ccdHomeDetails';
import {ResidenceType} from 'form/models/statementOfMeans/residence/residenceType';
import {Residence} from 'form/models/statementOfMeans/residence/residence';

describe('translate Home Details to CUI model', () => {
  it('should return undefined if Home Details doesnt exist', () => {
    //Given
    //When
    const output = toCUIHomeDetails(undefined);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return data if Home Type is owned', () => {
    //Given
    const input : CCDHomeDetails = {
      type: CCDHomeType.OWNED_HOME,
    };
    //When
    const output = toCUIHomeDetails(input);
    //Then
    const expected = new Residence(ResidenceType.OWN_HOME);
    expect(output).toEqual(expected);
  });

  it('should return undefined if Home Details is undefined', () => {
    //Given
    const input : CCDHomeDetails = {
      type: undefined,
      typeOtherDetails: undefined,
    };
    //When
    const output = toCUIHomeDetails(input);
    //Then
    const expected = new Residence(undefined, undefined);
    expect(output).toEqual(expected);
  });

  it('should return data if Home Details is jointly owned', () => {
    //Given
    const input : CCDHomeDetails = {
      type: CCDHomeType.JOINTLY_OWNED_HOME,
    };
    //When
    const output = toCUIHomeDetails(input);
    //Then
    const expected = new Residence(ResidenceType.JOINT_OWN_HOME);
    expect(output).toEqual(expected);
  });

  it('should return data if Home Details is private rental', () => {
    //Given
    const input : CCDHomeDetails = {
      type: CCDHomeType.PRIVATE_RENTAL,
    };
    //When
    const output = toCUIHomeDetails(input);
    //Then
    const expected = new Residence(ResidenceType.PRIVATE_RENTAL);
    expect(output).toEqual(expected);
  });

  it('should return data if Home Details is association home', () => {
    //Given
    const input : CCDHomeDetails = {
      type: CCDHomeType.ASSOCIATION_HOME,
    };
    //When
    const output = toCUIHomeDetails(input);
    //Then
    const expected = new Residence(ResidenceType.COUNCIL_OR_HOUSING_ASSN_HOME);
    expect(output).toEqual(expected);
  });

  it('should return data if Home Details is other', () => {
    //Given
    const input : CCDHomeDetails = {
      type: CCDHomeType.OTHER,
      typeOtherDetails: 'test',
    };
    //When
    const output = toCUIHomeDetails(input);
    //Then
    const expected = new Residence(ResidenceType.OTHER, 'test');
    expect(output).toEqual(expected);
  });
});
