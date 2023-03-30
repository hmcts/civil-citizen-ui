import {CCDAddress} from 'models/ccdResponse/ccdAddress';
import {Address} from 'form/models/address';

export const toCUIAddress = (address: CCDAddress) : Address => {
  if(!address){
    return new Address(address?.AddressLine1, address?.AddressLine2, address?.AddressLine3, address?.PostTown, address?.PostCode);
  }
};
