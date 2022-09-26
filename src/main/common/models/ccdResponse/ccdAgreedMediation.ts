import {Mediation} from '../../models/mediation/mediation';
import {YesNoToCcdTranslation} from '../../../common/form/models/yesNo';

export const toAgreedMediation = (mediation: Mediation): string => {
  return mediation?.canWeUse?.option ? YesNoToCcdTranslation.YES
    : mediation?.mediationDisagreement?.option ? YesNoToCcdTranslation.NO
      : mediation?.companyTelephoneNumber ? YesNoToCcdTranslation.YES
        : YesNoToCcdTranslation.NO;
};
