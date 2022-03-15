import {Disability} from '../form/models/statementOfMeans/disability';
import {SevereDisability} from '../form/models/statementOfMeans/severeDisability';
import {Cohabiting} from '../form/models/statementOfMeans/partner/cohabiting';

export class StatementOfMeans {
  disability?: Disability;
  severeDisability?: SevereDisability;
  cohabiting?: Cohabiting;
}
