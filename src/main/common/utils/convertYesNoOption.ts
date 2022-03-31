import {YesNo} from '../form/models/yesNo';

const convertToYesNo = (declared: boolean): YesNo => {
  let convertedYesNoValue = undefined;
  if (declared === true) {
    convertedYesNoValue = YesNo.YES;
  } else if (declared === false) {
    convertedYesNoValue = YesNo.NO;
  }
  return convertedYesNoValue;
};

const convertFromYesNo = (option: YesNo): boolean => {
  if (option) {
    switch (option) {
      case YesNo.YES:
        return true;
      case YesNo.NO:
        return false;
    }
  }
};

export {
  convertFromYesNo,
  convertToYesNo,
};
