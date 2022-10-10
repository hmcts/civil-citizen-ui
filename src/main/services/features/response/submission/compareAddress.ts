import {isEqual} from 'lodash';
import {PrimaryAddress} from 'common/models/primaryAddress';

export const addressHasChange = (address: PrimaryAddress, originalAddress: PrimaryAddress): boolean => {

  const addressObject = {
    PostCode: processAddressLine(address.PostCode),
    PostTown: processAddressLine( address.PostTown),
    AddressLine1: processAddressLine(address.AddressLine1),
    AddressLine2: processAddressLine(address.AddressLine2),
    AddressLine3: processAddressLine(address.AddressLine3),
  };

  const originalAddressObject = {
    PostCode: processAddressLine(originalAddress.PostCode),
    PostTown: processAddressLine(originalAddress.PostTown),
    AddressLine1: processAddressLine(originalAddress.AddressLine1),
    AddressLine2: processAddressLine(originalAddress.AddressLine2),
    AddressLine3: processAddressLine(originalAddress.AddressLine3),
  };

  return !isEqual(addressObject, originalAddressObject);
};

export const processAddressLine = (addressLine?: string) => {
  return addressLine? addressLine : '';
};
