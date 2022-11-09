import {GenericYesNo} from '../../common/form/models/genericYesNo';
import {DebtStartDate} from '../../common/models/claimantResponse/debtStartDate';
import {CCJRequest} from './claimantResponse/ccj/ccjRequest';

export class ClaimantResponse {
  hasDefendantPaidYou?: GenericYesNo;
  debtStartDate?: DebtStartDate;
  ccjRequest?: CCJRequest;
  intentionToProceed?: GenericYesNo;
}
