import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {ExpertCanStillExamine} from '../../models/directionsQuestionnaire/expertCanStillExamine';

export class DirectionQuestionnaire {
  triedToSettle?: GenericYesNo;
  defendantExpertEvidence?: GenericYesNo;
  sharedExpert?: GenericYesNo;
  requestExtra4weeks?: GenericYesNo;
  expertCanStillExamine?: ExpertCanStillExamine;

  constructor(triedToSettle?: GenericYesNo, defendantExpertEvidence?: GenericYesNo, requestExtra4weeks?: GenericYesNo, sharedExpert?: GenericYesNo, expertCanStillExamine?: ExpertCanStillExamine) {
    this.triedToSettle = triedToSettle;
    this.defendantExpertEvidence = defendantExpertEvidence;
    this.requestExtra4weeks = requestExtra4weeks;
    this.sharedExpert = sharedExpert;
    this.expertCanStillExamine = expertCanStillExamine;
  }
}
