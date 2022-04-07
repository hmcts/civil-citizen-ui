import {Disability} from '../form/models/statementOfMeans/disability';
import {SevereDisability} from '../form/models/statementOfMeans/severeDisability';
import {OtherDependants} from '../form/models/statementOfMeans/otherDependants';
import {PartnerAge} from '../form/models/statementOfMeans/partner/partnerAge';
import {CitizenBankAccount} from './citizenBankAccount';
import {Cohabiting} from '../form/models/statementOfMeans/partner/cohabiting';
import {PartnerSevereDisability} from '../form/models/statementOfMeans/partner/partnerSevereDisability';
import {PartnerDisability} from '../form/models/statementOfMeans/partner/partnerDisability';
import {PartnerPension} from '../form/models/statementOfMeans/partner/partnerPension';
import {Residence} from '../form/models/statementOfMeans/residence';
import {Employment} from './employment';
import {Dependants} from '../form/models/statementOfMeans/dependants/dependants';
import {TaxPayments} from './taxPayments';
import {Unemployment} from '../form/models/statementOfMeans/unemployment/unemployment';
import {ChildrenDisability} from '../form/models/statementOfMeans/dependants/childrenDisability';

export class StatementOfMeans {
  disability?: Disability;
  severeDisability?: SevereDisability;
  partnerAge?: PartnerAge;
  bankAccounts?: CitizenBankAccount[];
  otherDependants?: OtherDependants;
  cohabiting?: Cohabiting;
  employment?: Employment;
  taxPayments?: TaxPayments;
  partnerDisability?: PartnerDisability;
  partnerSevereDisability?: PartnerSevereDisability;
  residence?: Residence;
  partnerPension?: PartnerPension;
  dependants?: Dependants;
  numberOfChildrenLivingWithYou?: number;
  unemployment?: Unemployment;
  childrenDisability?: ChildrenDisability;
}
