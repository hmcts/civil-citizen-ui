import {ExpertDetailsList} from './expertDetailsList';
import {ExpertReportDetails} from './expertReportDetails/expertReportDetails';
import {SentExpertReports} from './sentExpertReports';
import {GenericYesNo} from '../../../../common/form/models/genericYesNo';
import {ExpertCanStillExamine} from './expertCanStillExamine';

export class Experts {
  expertReportDetails?: ExpertReportDetails;
  sentExpertReports?: SentExpertReports;
  sharedExpert?: GenericYesNo;
  defendantExpertEvidence?: GenericYesNo;
  permissionForExpert?: GenericYesNo;
  expertCanStillExamine?: ExpertCanStillExamine;
  expertDetailsList?: ExpertDetailsList;

}
