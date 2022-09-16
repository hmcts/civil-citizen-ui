import {GenericYesNo} from '../../../common/form/models/genericYesNo';

export class DirectionQuestionnaire {
  triedToSettle?: GenericYesNo;
  defendantExpertEvidence?: GenericYesNo;
  requestExtra4weeks?: GenericYesNo;

  constructor(triedToSettle?: GenericYesNo, defendantExpertEvidence?: GenericYesNo, requestExtra4weeks?: GenericYesNo) {
    this.triedToSettle = triedToSettle;
    this.defendantExpertEvidence = defendantExpertEvidence;
    this.requestExtra4weeks = requestExtra4weeks;
  }
}
