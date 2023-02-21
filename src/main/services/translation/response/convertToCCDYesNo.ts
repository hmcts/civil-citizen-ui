import {YesNo, YesNoUpperCamelCase} from '../../../common/form/models/yesNo';

export const toCCDYesNo = (value: YesNo | string) => {
  if(value) {
    return value === YesNo.YES ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO;
  }
};
