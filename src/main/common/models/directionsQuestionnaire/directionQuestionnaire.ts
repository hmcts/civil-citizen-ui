import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {DefendantExpertEvidence} from '../../models/directionsQuestionnaire/defendantExpertEvidence';

export class DirectionQuestionnaire {
  triedToSettle?: GenericYesNo;
  defendantExpertEvidence?: DefendantExpertEvidence;
  requestExtra4weeks?: GenericYesNo;

  constructor(triedToSettle?: GenericYesNo, defendantExpertEvidence?: DefendantExpertEvidence, requestExtra4weeks?: GenericYesNo) {
    this.triedToSettle = triedToSettle;
    this.defendantExpertEvidence = defendantExpertEvidence;
    this.requestExtra4weeks = requestExtra4weeks;
  }
}
