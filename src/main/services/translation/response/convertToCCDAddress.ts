import {CCDAddress} from '../../../common/models/ccdResponse/ccdAddress';
import {Address} from '../../../common/form/models/address';

export const toCCDAddress = (primaryAddress: Address): CCDAddress => {
  return {
    AddressLine1: primaryAddress?.addressLine1,
    AddressLine2: primaryAddress?.addressLine2,
    AddressLine3: primaryAddress?.addressLine3,
    PostCode: primaryAddress?.postCode,
    PostTown: primaryAddress?.city,
  };
};
