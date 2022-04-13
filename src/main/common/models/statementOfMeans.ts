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
import {Employers} from 'common/form/models/statementOfMeans/employment/employers';
import {Dependants} from '../form/models/statementOfMeans/dependants/dependants';
import {PriorityDebts} from '../form/models/statementOfMeans/priorityDebts';
import {SelfEmployedAs} from './selfEmployedAs';
import {TaxPayments} from './taxPayments';
import {Unemployment} from '../form/models/statementOfMeans/unemployment/unemployment';
import {ChildrenDisability} from '../form/models/statementOfMeans/dependants/childrenDisability';
import {RegularExpenses} from '../form/models/statementOfMeans/expensesAndIncome/regularExpenses';
import {Debts} from '../form/models/statementOfMeans/debts/debts';

export class StatementOfMeans {
  disability?: Disability;
  severeDisability?: SevereDisability;
  partnerAge?: PartnerAge;
  bankAccounts?: CitizenBankAccount[];
  otherDependants?: OtherDependants;
  cohabiting?: Cohabiting;
  employment?: Employment;
  employers?: Employers;
  taxPayments?: TaxPayments;
  partnerDisability?: PartnerDisability;
  partnerSevereDisability?: PartnerSevereDisability;
  residence?: Residence;
  partnerPension?: PartnerPension;
  dependants?: Dependants;
  numberOfChildrenLivingWithYou?: number;
  selfEmployedAs?: SelfEmployedAs;
  unemployment?: Unemployment;
  childrenDisability?: ChildrenDisability;
  priorityDebts?: PriorityDebts;
  regularExpenses?: RegularExpenses;
  debts?: Debts;
}
