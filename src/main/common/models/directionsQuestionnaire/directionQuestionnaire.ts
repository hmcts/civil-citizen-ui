import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {ExpertReports} from './expertReports';

export class DirectionQuestionnaire {
  triedToSettle?: GenericYesNo;
  sharedExpert?: GenericYesNo;
  requestExtra4weeks?: GenericYesNo;
  expertReports?: ExpertReports;
}
