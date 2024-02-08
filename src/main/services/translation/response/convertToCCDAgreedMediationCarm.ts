import {MediationCarm} from 'models/mediation/mediationCarm';
import {YesNoUpperCamelCase} from 'form/models/yesNo';

export const toAgreedMediationCarm = (mediationCarm: MediationCarm) => {
  if (mediationCarm?.hasAvailabilityMediationFinished && mediationCarm?.hasTelephoneMeditationAccessed) {
    return YesNoUpperCamelCase.YES;
  } else {
    return YesNoUpperCamelCase.NO;
  }
};
