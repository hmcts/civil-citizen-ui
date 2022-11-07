import {GenericYesNo} from '../../common/form/models/genericYesNo';
import {RejectionReason} from 'common/form/models/claimantResponse/rejectionReason';

export class ClaimantResponse {
  hasDefendantPaidYou?: GenericYesNo;
  rejectionReason?: RejectionReason;
}
