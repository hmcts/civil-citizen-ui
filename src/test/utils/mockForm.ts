import {CitizenAddress} from '../../main/common/form/models/citizenAddress';
import {CitizenCorrespondenceAddress} from '../../main/common/form/models/citizenCorrespondenceAddress';

export const buildCitizenAddress = (): CitizenAddress => {
  const citizenAddress =  new CitizenAddress();
  citizenAddress.primaryAddressLine1 = 'primaryAddressLine1';
  citizenAddress.primaryAddressLine2 = 'primaryAddressLine2';
  citizenAddress.primaryAddressLine3 = 'primaryAddressLine3';
  citizenAddress.primaryPostCode = 'primaryPostCode';
  citizenAddress.primaryCity = 'primaryCity';
  return  citizenAddress;
};

export const buildCitizenCorrespondenceAddress = () : CitizenCorrespondenceAddress => {
  const citizenCorrespondenceAddress = new CitizenCorrespondenceAddress();
  citizenCorrespondenceAddress.correspondenceAddressLine1 = 'correspondenceAddressLine1';
  citizenCorrespondenceAddress.correspondenceAddressLine2 = 'correspondenceAddressLine2';
  citizenCorrespondenceAddress.correspondenceAddressLine3 = 'correspondenceAddressLine3';
  citizenCorrespondenceAddress.correspondenceCity = 'correspondenceCity';
  citizenCorrespondenceAddress.correspondencePostCode = 'correspondencePostCode';
  return citizenCorrespondenceAddress;
};

