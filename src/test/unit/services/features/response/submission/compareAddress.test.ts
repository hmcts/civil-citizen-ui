import {Address} from '../../../../../../main/common/form/models/address';
import {
  addressHasChange,
  processAddressLine,
} from '../../../../../../main/services/features/response/submission/compareAddress';

const addressData: Address = new Address('Street', '1', '5A', 'XXX123');
const completeAddress: Address = new Address('Street', '1', '5A', 'XXX123', '');
const addressUpdated: Address = new Address('Street', '1', '5A', 'XXX123', '0000');
const addressWithEmptyString: Address = new Address('Street', '1', '5A', 'XXX123', '');
const addressWithUndefined: Address = new Address('Street', '1', '5A', 'XXX123', undefined);

describe('Compare addresses util', () => {
  it('should return false if same addresses', () => {
    //When
    const isAddressUpdated = addressHasChange(completeAddress, completeAddress);
    //Then
    expect(isAddressUpdated).toEqual(false);
  });
  it('should return false if same addresses excluding Country and County', () => {
    //When
    const isAddressUpdated = addressHasChange(completeAddress, addressData);
    //Then
    expect(isAddressUpdated).toEqual(false);
  });
  it('should return false comparing undefined with empty string', () => {
    //When
    const isAddressUpdated = addressHasChange(addressWithEmptyString, addressWithUndefined);
    //Then
    expect(isAddressUpdated).toEqual(false);
  });
  it('should return true if address has change', () => {
    //When
    const isAddressUpdated = addressHasChange(completeAddress, addressUpdated);
    //Then
    expect(isAddressUpdated).toEqual(true);
  });
  it('should return empty string when address line does not exist', () => {
    //When
    const result = processAddressLine();
    //Then
    expect(result).toEqual('');
  });
  it('should return address line when address exists', () => {
    //Given
    const addressLine1 = 'lalala';
    //When
    const result = processAddressLine(addressLine1);
    //Then
    expect(result).toEqual(addressLine1);

  });
});
