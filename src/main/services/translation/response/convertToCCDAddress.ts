import {CCDAddress} from '../../../common/models/ccdResponse/ccdAddress';
import {PrimaryAddress} from '../../../common/models/primaryAddress';

export const toCCDAddress = (primaryAddress: PrimaryAddress): CCDAddress => {
  return {
    AddressLine1: primaryAddress?.AddressLine1,
    AddressLine2: primaryAddress?.AddressLine2,
    AddressLine3: primaryAddress?.AddressLine3,
    Country: primaryAddress?.Country,
    County: primaryAddress?.County,
    PostCode: primaryAddress?.PostCode,
    PostTown: primaryAddress?.PostTown,
  };
};
