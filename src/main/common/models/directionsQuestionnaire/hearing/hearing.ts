import {GenericYesNo} from '../../../form/models/genericYesNo';
import {DeterminationWithoutHearing} from './determinationWithoutHearing';
import {ConsiderClaimantDocuments} from './considerClaimantDocuments';

export class Hearing {
  triedToSettle?: GenericYesNo;
  determinationWithoutHearing?: DeterminationWithoutHearing;
  requestExtra4weeks?: GenericYesNo;
  considerClaimantDocuments?: ConsiderClaimantDocuments;
  next12MonthsCanNotHearing?: GenericYesNo;
}
