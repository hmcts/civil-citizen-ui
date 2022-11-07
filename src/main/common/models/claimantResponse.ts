import {CitizenDate} from '../form/models/claim/claimant/citizenDate';
import {GenericYesNo} from '../form/models/genericYesNo';

export class ClaimantResponse {
  hasDefendantPaidYou?: GenericYesNo;
  datePaid: CitizenDate;
}
