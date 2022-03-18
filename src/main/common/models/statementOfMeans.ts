import {Disability} from '../form/models/statementOfMeans/disability';
import {SevereDisability} from '../form/models/statementOfMeans/severeDisability';
import {PartnerAge} from '../form/models/statementOfMeans/partner/partnerAge';
import {CitizenBankAccount} from './citizenBankAccount';
import {Cohabiting} from '../form/models/statementOfMeans/partner/cohabiting';
import {PartnerSevereDisability} from '../form/models/statementOfMeans/partner/partnerSevereDisability';

export class StatementOfMeans {
  disability?: Disability;
  severeDisability?: SevereDisability;
  partnerAge?: PartnerAge;
  bankAccounts?: CitizenBankAccount[];
  cohabiting?: Cohabiting;
  partnerSevereDisability?: PartnerSevereDisability;
}
