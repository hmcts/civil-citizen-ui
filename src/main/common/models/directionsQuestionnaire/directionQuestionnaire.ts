import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {ConsiderClaimantDocuments} from 'models/directionsQuestionnaire/considerClaimantDocuments';
import {ExpertCanStillExamine} from '../../models/directionsQuestionnaire/expertCanStillExamine';
import {Vulnerability} from '../../models/directionsQuestionnaire/vulnerability';

export class DirectionQuestionnaire {
  triedToSettle?: GenericYesNo;
  defendantExpertEvidence?: GenericYesNo;
  considerClaimantDocuments?: ConsiderClaimantDocuments;
  sharedExpert?: GenericYesNo;
  requestExtra4weeks?: GenericYesNo;
  expertCanStillExamine?: ExpertCanStillExamine;
  defendantYourselfEvidence?: GenericYesNo;
  vulnerability?: Vulnerability;

  constructor(triedToSettle?: GenericYesNo, defendantExpertEvidence?: GenericYesNo, requestExtra4weeks?: GenericYesNo, sharedExpert?: GenericYesNo, expertCanStillExamine?: ExpertCanStillExamine, defendantYourselfEvidence?: GenericYesNo, vulnerability?: Vulnerability) {
    this.triedToSettle = triedToSettle;
    this.defendantExpertEvidence = defendantExpertEvidence;
    this.requestExtra4weeks = requestExtra4weeks;
    this.sharedExpert = sharedExpert;
    this.expertCanStillExamine = expertCanStillExamine;
    this.defendantYourselfEvidence = defendantYourselfEvidence;
    this.vulnerability = vulnerability;
  }
}
