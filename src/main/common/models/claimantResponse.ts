import {GenericYesNo} from '../../common/form/models/genericYesNo';
import {CCJRequest} from './claimantResponse/ccj/ccjRequest';

export class ClaimantResponse {
  hasDefendantPaidYou?: GenericYesNo;
  ccjRequest?: CCJRequest;
  intentionToProceed?: GenericYesNo;
}
