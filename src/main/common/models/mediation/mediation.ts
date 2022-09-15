import {CanWeUse} from '../../../common/models/mediation/canWeUse';
import {CompanyTelephoneNumber} from '../../form/models/mediation/companyTelephoneNumber';
import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {NoMediationReason} from '../../../common/form/models/mediation/noMediationReason';

export class Mediation {
  canWeUse?: CanWeUse;
  mediationDisagreement?: GenericYesNo;
  noMediationReason?: NoMediationReason;
  companyTelephoneNumber: CompanyTelephoneNumber;

  constructor(canWeUse?: CanWeUse, mediationDisagreement?: GenericYesNo, noMediationReason?: NoMediationReason, companyTelephoneNumber?: CompanyTelephoneNumber) {
    this.canWeUse = canWeUse;
    this.mediationDisagreement = mediationDisagreement;
    this.noMediationReason = noMediationReason;
    this.companyTelephoneNumber = companyTelephoneNumber;
  }
}
