import {Disability} from '../form/models/statementOfMeans/disability';
import {SevereDisability} from '../form/models/statementOfMeans/severeDisability';
import { Partner } from '../form/models/statementOfMeans/partner';
import { OtherDependants } from '../form/models/statementOfMeans/otherDependants';
import {CitizenBankAccount} from './citizenBankAccount';
export class StatementOfMeans {
  disability?: Disability;
  severeDisability?: SevereDisability;
  partnerAge?: Partner;
  bankAccounts?: CitizenBankAccount[];
  otherDependants?: OtherDependants;
}
