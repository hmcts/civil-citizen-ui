import {CCDAddress} from 'models/ccdResponse/ccdAddress';
import {toCUIAddress} from 'services/translation/convertToCUI/convertToCUIAddress';
import {Address} from 'form/models/address';

describe('translate CCDAddress to CUI Addresss model', () => {

  it('should return undefined if CCDAddress doesnt exist', () => {
    //Given
    const addressCCDEmpty: CCDAddress = undefined;
    //When
    const cuiAddress = toCUIAddress(addressCCDEmpty);
    //Then
    expect(cuiAddress).toBe(undefined);
  });

  it('should translate CCD Address to CUI', () => {
    const address: Address = new Address('Street test', '1', '1A', 'test', 'sl11gf');
    //Given
    const addressCCD: CCDAddress = {
      AddressLine1: 'Street test',
      AddressLine2: '1',
      AddressLine3: '1A',
      PostTown: 'test',
      PostCode: 'sl11gf',
      Country: 'test',
      County: 'test',
    };
    //When
    const cuiAddress = toCUIAddress(addressCCD);
    //Then
    expect(cuiAddress).toMatchObject(address);
  });
});
