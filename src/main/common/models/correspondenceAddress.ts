import {CitizenCorrespondenceAddress} from '../form/models/citizenCorrespondenceAddress';

export interface CorrespondenceAddress {
  County?: string;
  Country?: string;
  PostCode?: string;
  PostTown?: string;
  AddressLine1?: string;
  AddressLine2?: string;
  AddressLine3?: string;
}

export const convertToCorrespondenceAddress = (citizenCorrespondenceAddress: CitizenCorrespondenceAddress): CorrespondenceAddress => {
  return {
    AddressLine1: citizenCorrespondenceAddress.correspondenceAddressLine1,
    AddressLine2: citizenCorrespondenceAddress.correspondenceAddressLine2,
    AddressLine3: citizenCorrespondenceAddress.correspondenceAddressLine3,
    PostTown: citizenCorrespondenceAddress.correspondenceCity,
    PostCode: citizenCorrespondenceAddress.correspondencePostCode,
  };
};
