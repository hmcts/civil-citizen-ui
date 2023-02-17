import {YesNoUpperCamelCase} from 'form/models/yesNo';

export const toCCDExpertRequired = (required: boolean): YesNoUpperCamelCase => {
  return required ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO;
};
