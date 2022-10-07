import {addressHasChange} from "../../../../../../main/services/features/response/submission/compareAddress";

const addressData = {
  PostTown: 'XXX123',
  AddressLine1: 'Street',
  AddressLine2: '1',
  AddressLine3: '5A',
};

const completeAddress = {
  County: 'Test',
  Country: 'Test',
  ...addressData
};

const addressRedis = {
  ...addressData
};

const addressUpdated = {
  ...addressData,
  PostCode: '0000',
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
    const isAddressUpdated = addressHasChange(completeAddress, addressRedis);
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
