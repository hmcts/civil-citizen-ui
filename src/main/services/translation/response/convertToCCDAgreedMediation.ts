import {Mediation} from 'models/mediation/mediation';
import {YesNoUpperCamelCase} from 'form/models/yesNo';

export const toAgreedMediation = (mediation: Mediation) => {
  if (mediation?.canWeUse?.option) {
    return YesNoUpperCamelCase.YES;
  } else if (mediation?.mediationDisagreement?.option) {
    return YesNoUpperCamelCase.NO;
  } else if (mediation?.companyTelephoneNumber) {
    return YesNoUpperCamelCase.YES;
  } else {
    return YesNoUpperCamelCase.NO;
  }
};
