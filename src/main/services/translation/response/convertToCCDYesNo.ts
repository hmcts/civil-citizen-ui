import {YesNo, YesNoUpperCamelCase} from "../../../common/form/models/yesNo"

export const toCCDYesNo = (value: YesNo) => {
  return value === YesNo.YES ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO;
}
