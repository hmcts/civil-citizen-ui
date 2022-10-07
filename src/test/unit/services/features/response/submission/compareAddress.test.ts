import { PrimaryAddress } from "../../../../../../main/common/models/primaryAddress";
import {addressHasChange} from "../../../../../../main/services/features/response/submission/compareAddress";

const addressData: PrimaryAddress = {
  PostTown: 'XXX123',
  AddressLine1: 'Street',
  AddressLine2: '1',
  AddressLine3: '5A',
};

const completeAddress: PrimaryAddress = {
  County: 'Test',
  Country: 'Test',
  ...addressData
};

const addressUpdated: PrimaryAddress = {
  ...addressData,
  PostCode: '0000',
};
const addressWithEmptyString: PrimaryAddress = {
  ...addressData,
  PostCode: '',
};
const addressWithUndefined: PrimaryAddress = {
  ...addressData,
  PostCode: undefined,
};

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
});
