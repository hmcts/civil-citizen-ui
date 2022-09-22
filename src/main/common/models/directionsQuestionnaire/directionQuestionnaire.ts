import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {ConsiderClaimantDocuments} from 'models/directionsQuestionnaire/considerClaimantDocuments';
import {ExpertCanStillExamine} from '../../models/directionsQuestionnaire/expertCanStillExamine';
import {Experts} from './experts/experts';

export class DirectionQuestionnaire {
  permissionForExpert?: GenericYesNo;
  triedToSettle?: GenericYesNo;
  defendantExpertEvidence?: GenericYesNo;
  considerClaimantDocuments?: ConsiderClaimantDocuments;
  sharedExpert?: GenericYesNo;
  requestExtra4weeks?: GenericYesNo;
  expertCanStillExamine?: ExpertCanStillExamine;
  defendantYourselfEvidence?: GenericYesNo;
  experts?: Experts;

  constructor(triedToSettle?: GenericYesNo, defendantExpertEvidence?: GenericYesNo, requestExtra4weeks?: GenericYesNo, sharedExpert?: GenericYesNo, expertCanStillExamine?: ExpertCanStillExamine, defendantYourselfEvidence?: GenericYesNo, experts?: Experts) {
    this.triedToSettle = triedToSettle;
    this.defendantExpertEvidence = defendantExpertEvidence;
    this.requestExtra4weeks = requestExtra4weeks;
    this.sharedExpert = sharedExpert;
    this.expertCanStillExamine = expertCanStillExamine;
    this.defendantYourselfEvidence = defendantYourselfEvidence;
    this.experts = exports;
  }
}
