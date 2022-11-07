import {GenericYesNo} from '../../common/form/models/genericYesNo';
import {DebtStartDate} from '../../common/models/claimantResponse/debtStartDate';

export class ClaimantResponse {
  hasDefendantPaidYou?: GenericYesNo;
  debtStartDate?: DebtStartDate;
}
