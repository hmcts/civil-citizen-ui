import {Disability} from '../form/models/statementOfMeans/disability';
import {SevereDisability} from '../form/models/statementOfMeans/severeDisability';
import {CitizenBankAccount} from './citizenBankAccount';
import {Residence} from '../form/models/statementOfMeans/residence';

export class StatementOfMeans {
  disability?: Disability;
  severeDisability?: SevereDisability;
  bankAccounts?: CitizenBankAccount[];
  residence?: Residence;
}
