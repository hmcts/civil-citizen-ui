import {isEqual} from 'lodash';
import {Address} from 'form/models/address';

export const addressHasChange = (address: Address, originalAddress: Address): boolean => {

  const addressObject = {
    postCode: processAddressLine(address.postCode),
    city: processAddressLine(address.city),
    addressLine1: processAddressLine(address.addressLine1),
    addressLine2: processAddressLine(address.addressLine2),
    addressLine3: processAddressLine(address.addressLine3),
  };

  const originalAddressObject = {
    postCode: processAddressLine(originalAddress?.postCode),
    city: processAddressLine(originalAddress?.city),
    addressLine1: processAddressLine(originalAddress?.addressLine1),
    addressLine2: processAddressLine(originalAddress?.addressLine2),
    addressLine3: processAddressLine(originalAddress?.addressLine3),
  };

  return !isEqual(addressObject, originalAddressObject);
};

export const processAddressLine = (addressLine?: string) => {
  return addressLine || '';
};
