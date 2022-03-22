import {Disability} from '../form/models/statementOfMeans/disability';
import {SevereDisability} from '../form/models/statementOfMeans/severeDisability';
import {PartnerAge} from '../form/models/statementOfMeans/partner/partnerAge';
import {CitizenBankAccount} from './citizenBankAccount';
import {Cohabiting} from '../form/models/statementOfMeans/partner/cohabiting';
import {PartnerSevereDisability} from '../form/models/statementOfMeans/partner/partnerSevereDisability';
import {PartnerDisability} from '../form/models/statementOfMeans/partner/partnerDisability';
import {Residence} from '../form/models/statementOfMeans/residence';
import {Employment} from './employment';
import {
  ChildrenDisability
} from "common/form/models/statementOfMeans/dependants/childrenDisability";

export class StatementOfMeans {
  disability?: Disability;
  severeDisability?: SevereDisability;
  partnerAge?: PartnerAge;
  bankAccounts?: CitizenBankAccount[];
  cohabiting?: Cohabiting;
  employment?: Employment;
  partnerDisability?: PartnerDisability;
  partnerSevereDisability?: PartnerSevereDisability;
  residence?: Residence;
  childrenDisability?: ChildrenDisability;
}
