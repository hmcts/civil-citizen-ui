import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {DefendantExpertEvidence} from '../../models/directionsQuestionnaire/defendantExpertEvidence';

export class DirectionQuestionnaire {
  triedToSettle?: GenericYesNo;
  defendantExpertEvidence?: DefendantExpertEvidence;

  constructor(triedToSettle?: GenericYesNo, defendantExpertEvidence?: DefendantExpertEvidence) {
    this.triedToSettle = triedToSettle;
    this.defendantExpertEvidence = defendantExpertEvidence;

  }
}
