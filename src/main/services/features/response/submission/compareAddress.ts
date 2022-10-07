import {isEqual} from 'lodash';
import {PrimaryAddress} from 'common/models/primaryAddress';

export const addressHasChange = (address: PrimaryAddress, originalAddress: PrimaryAddress): boolean => {

  const addressObject = {
    PostCode: address.PostCode ? address.PostCode : '',
    PostTown: address.PostTown ? address.PostTown : '',
    AddressLine1: address.AddressLine1 ? address.AddressLine1 : '',
    AddressLine2: address.AddressLine2 ? address.AddressLine2 : '',
    AddressLine3: address.AddressLine3 ? address.AddressLine3 : '',
  };

  const originalAddressObject = {
    PostCode: originalAddress.PostCode ? originalAddress.PostCode : '',
    PostTown: originalAddress.PostTown ? originalAddress.PostTown : '',
    AddressLine1: originalAddress.AddressLine1 ? originalAddress.AddressLine1 : '',
    AddressLine2: originalAddress.AddressLine2 ? originalAddress.AddressLine2 : '',
    AddressLine3: originalAddress.AddressLine3 ? originalAddress.AddressLine3 : '',
  };

  return !isEqual(addressObject, originalAddressObject);
};
