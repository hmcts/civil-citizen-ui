import {Mediation} from '../../../common/models/mediation/mediation';
import {YesNoUpperCase} from '../../../common/form/models/yesNo';

export const toAgreedMediation = (mediation: Mediation): string => {
  if (mediation?.canWeUse?.option) {
    return YesNoUpperCase.YES;
  } else if (mediation?.mediationDisagreement?.option) {
    return YesNoUpperCase.NO;
  } else if (mediation?.companyTelephoneNumber) {
    return YesNoUpperCase.YES;
  } else {
    return YesNoUpperCase.NO;
  }
};
