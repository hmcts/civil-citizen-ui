import {YesNo} from "common/form/models/yesNo";

export const toAgreedMediation = (option: YesNo): string => {
  if (option && option === YesNo.YES) {
    return 'Yes';
  } else {
    return 'No';
  }
};
