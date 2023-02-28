import {YesNo, YesNoUpperCamelCase} from 'common/form/models/yesNo';
import {GenericYesNo} from 'form/models/genericYesNo';

export const toCCDYesNo = (value: YesNo) => {
  if (value)
    return value === YesNo.YES ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO;
};

export const toCCDYesNoFromGenericYesNo = (value: GenericYesNo) => {
  if(value?.option)
    return value?.option === YesNo.YES ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO;
};

export const toCCDYesNoFromBoolean = (value: boolean) => {
  if(value !== undefined)
    return value ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO;
};
