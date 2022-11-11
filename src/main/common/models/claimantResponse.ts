import {CitizenDate} from '../form/models/claim/claimant/citizenDate';
import {GenericYesNo} from '../form/models/genericYesNo';
import {CCJRequest} from './claimantResponse/ccj/ccjRequest';
export class ClaimantResponse {
  hasDefendantPaidYou?: GenericYesNo;
  datePaid: CitizenDate;
  hasPartPaymentBeenAccepted?: GenericYesNo;
  ccjRequest?: CCJRequest;
  intentionToProceed?: GenericYesNo;
}
