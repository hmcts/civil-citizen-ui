import {YesNo} from "common/form/models/yesNo";
import {GenericYesNo} from "common/form/models/genericYesNo";

export const toAgreedMediation = (option: GenericYesNo): string => {
  if (!option || option.option === YesNo.YES) {
    return 'Yes';
  } else {
    return 'No';
  }
};
