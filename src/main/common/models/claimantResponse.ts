import {DatePaid} from '../form/models/clamantResponse/paidInFull/datePaid';
import {GenericYesNo} from '../form/models/genericYesNo';

export class ClaimantResponse {
  hasDefendantPaidYou?: GenericYesNo;
  datePaid: DatePaid;
}
