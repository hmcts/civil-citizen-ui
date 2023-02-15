import {YesNo, YesNoUpperCamelCase} from '../../../common/form/models/yesNo';
import {GenericYesNo} from 'form/models/genericYesNo';

export const toCCDYesNo = (value: YesNo) => {
  return value === undefined ? undefined :
    value === YesNo.YES ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO;
};

export const toCCDYesNoFromGenericYesNo = (value: GenericYesNo) => {
  return value?.option === undefined ? undefined :
    value?.option === YesNo.YES ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO;
};

export const toCCDYesNoFromBoolean = (value: boolean) => {
  return value === undefined ? undefined :
    value ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO;
};
