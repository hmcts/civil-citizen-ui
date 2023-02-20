import {YesNo} from "form/models/yesNo";

export const getEmptyStringIfUndefined = (value: string): string => value || '';

export const getAffirmation =(value:string)=> {
  if (value===YesNo.YES)
    return "COMMON.YES";

  if (value === YesNo.NO)
    return "COMMON.NO";

  return;

}