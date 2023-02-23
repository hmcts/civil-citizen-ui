import {CCDResponseType} from 'models/ccdResponse/ccdResponseType';
import {ResponseType} from "form/models/responseType";

export const toCCDResponseType = (responseType: string): string => {
  if(responseType === ResponseType.FULL_ADMISSION)
    return CCDResponseType.FULL_ADMISSION;
  if(responseType === ResponseType.PART_ADMISSION)
    return CCDResponseType.PART_ADMISSION;
  if(responseType === ResponseType.FULL_DEFENCE)
    return CCDResponseType.FULL_DEFENCE;
};
