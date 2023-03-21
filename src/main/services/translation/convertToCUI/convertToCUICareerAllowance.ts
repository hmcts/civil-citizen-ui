import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {GenericYesNo} from 'form/models/genericYesNo';
import {toCUIGenericYesNo} from 'services/translation/convertToCUI/convertToCUIYesNo';

export const toCUICarerAllowanceCredit = (careerAllowancePA: YesNoUpperCamelCase, careerAllowanceFA: YesNoUpperCamelCase): GenericYesNo => {
  if (!careerAllowancePA && !careerAllowanceFA) return undefined;

  if (careerAllowancePA) {
    return toCUIGenericYesNo(careerAllowancePA);
  }

  if (careerAllowanceFA) {
    return toCUIGenericYesNo(careerAllowanceFA);
  }
};

