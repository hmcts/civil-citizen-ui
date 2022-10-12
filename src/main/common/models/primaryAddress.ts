import {Address} from '../form/models/address';

export interface PrimaryAddress {
  County?: string;
  Country?: string;
  PostCode?: string;
  PostTown?: string;
  AddressLine1?: string;
  AddressLine2?: string;
  AddressLine3?: string;
}

export const convertToPrimaryAddress = (citizenAddress: Address ): PrimaryAddress => {
  return {
    AddressLine1: citizenAddress.primaryAddressLine1,
    AddressLine2: citizenAddress.primaryAddressLine2,
    AddressLine3: citizenAddress.primaryAddressLine3,
    PostTown: citizenAddress.primaryCity,
    PostCode: citizenAddress.primaryPostCode,
  };
};
