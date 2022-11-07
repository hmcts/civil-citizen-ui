import {DatePaid} from '../../common/form/models/paidInFull/datePaid';
import {GenericYesNo} from '../form/models/genericYesNo';

export class ClaimantResponse {
  hasDefendantPaidYou?: GenericYesNo;
  datePaid: DatePaid;
}
