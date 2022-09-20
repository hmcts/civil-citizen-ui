import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {ConsiderClaimantDocuments} from 'models/directionsQuestionnaire/considerClaimantDocuments';

export class DirectionQuestionnaire {
  triedToSettle?: GenericYesNo;
  considerClaimantDocuments?: ConsiderClaimantDocuments;
  sharedExpert?: GenericYesNo;
  requestExtra4weeks?: GenericYesNo;
}
