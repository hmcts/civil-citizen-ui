import {GenericYesNo} from '../../common/form/models/genericYesNo';
import {CCJRequest} from './claimantResponse/ccj/ccjRequest';
import {DebtRespiteScheme} from './claimantResponse/debtRespiteScheme';

export class ClaimantResponse {
  hasDefendantPaidYou?: GenericYesNo;
  ccjRequest?: CCJRequest;
  intentionToProceed?: GenericYesNo;
  debtRespiteScheme?: DebtRespiteScheme;
}
