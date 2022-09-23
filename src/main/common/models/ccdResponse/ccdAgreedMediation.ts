import {Mediation} from 'models/mediation/mediation';

export const toAgreedMediation = (mediation: Mediation): string => {
  return mediation?.canWeUse?.option ? 'Yes' : mediation?.mediationDisagreement?.option ? 'No' : mediation?.companyTelephoneNumber ? 'Yes' : 'No';
};
