import {GenericYesNo} from '../../form/models/genericYesNo';
import {DebtRespiteScheme} from '../../models/claimantResponse/debtRespiteScheme';

export class ClaimantResponse {
  hasDefendantPaidYou?: GenericYesNo;
  debtRespiteScheme?: DebtRespiteScheme;
}
