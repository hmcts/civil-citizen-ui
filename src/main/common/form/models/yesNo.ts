import {GenericYesNo} from 'form/models/genericYesNo';

export enum YesNo {
  YES = 'yes',
  NO = 'no'
}
export enum YesNoUpperCase {
  YES = 'YES',
  NO = 'NO'
}
export enum YesNoNotReceived {
  YES = 'yes',
  NO = 'no',
  NOT_RECEIVED = 'not-received'
}
export enum YesNoUpperCamelCase {
  YES = 'Yes',
  NO = 'No',
}
export const toUpperYesOrNo = (yesNo: GenericYesNo): YesNoUpperCamelCase => {
  return yesNo?.option.toLowerCase() ===  'yes' ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO;
};
