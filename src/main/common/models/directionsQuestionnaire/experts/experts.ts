import {ExpertDetailsList} from './expertDetailsList';
import {SentExpertReports} from './sentExpertReports';
import {GenericYesNo} from 'form/models/genericYesNo';
import {ExpertCanStillExamine} from './expertCanStillExamine';

export class Experts {
  expertReportDetails?: GenericYesNo;
  sentExpertReports?: SentExpertReports;
  sharedExpert?: GenericYesNo;
  expertEvidence?: GenericYesNo;
  permissionForExpert?: GenericYesNo;
  expertCanStillExamine?: ExpertCanStillExamine;
  expertDetailsList?: ExpertDetailsList;
  expertRequired?: boolean;
}
