import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {ExpertReportDetails} from './expertReportDetails/expertReportDetails';
// TODO : create another model for here different from validation
export class DirectionQuestionnaire {
  triedToSettle?: GenericYesNo;
  sharedExpert?: GenericYesNo;
  requestExtra4weeks?: GenericYesNo;
  expertReportDetails?: ExpertReportDetails;
}
