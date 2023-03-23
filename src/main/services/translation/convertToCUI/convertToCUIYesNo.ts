import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {GenericYesNo} from 'form/models/genericYesNo';

export const toCUIGenericYesNo = (value: YesNoUpperCamelCase) : GenericYesNo=> {
  if (value) {
    return value === YesNoUpperCamelCase.YES ? new GenericYesNo(YesNo.YES) : new GenericYesNo(YesNo.NO);
  }
};

export const toCUIYesNo = (value: YesNoUpperCamelCase) : YesNo=> {
  if (value) {
    return value === YesNoUpperCamelCase.YES ? YesNo.YES : YesNo.NO;
  }
};
