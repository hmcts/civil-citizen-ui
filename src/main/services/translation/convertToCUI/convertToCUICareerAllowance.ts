import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {GenericYesNo} from 'form/models/genericYesNo';
import {toCUIGenericYesNo} from 'services/translation/convertToCUI/convertToCUIYesNo';

export const toCUICarerAllowanceCredit = (careerAllowance: YesNoUpperCamelCase): GenericYesNo => {
  if (careerAllowance) return toCUIGenericYesNo(careerAllowance);
};

