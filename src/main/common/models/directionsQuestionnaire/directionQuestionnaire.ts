import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {ExpertReportDetails} from './expertReportDetails';

export class DirectionQuestionnaire {
  triedToSettle?: GenericYesNo;
  sharedExpert?: GenericYesNo;
  requestExtra4weeks?: GenericYesNo;
  expertReportDetails?: ExpertReportDetails;
}
