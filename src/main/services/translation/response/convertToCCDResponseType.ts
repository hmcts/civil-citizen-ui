import {CCDResponseType} from 'models/ccdResponse/ccdResponseType';

export const toCCDResponseType = (responseType: string): string => {
  if(responseType === 'I admit all of the claim')
    return CCDResponseType.FULL_ADMISSION;
  if(responseType === 'I admit part of the claim')
    return CCDResponseType.PART_ADMISSION;
  if(responseType === 'I reject all of the claim')
    return CCDResponseType.FULL_DEFENCE;
};
