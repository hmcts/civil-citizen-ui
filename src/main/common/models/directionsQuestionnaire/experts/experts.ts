import { ExpertDetailsList } from './expertDetailsList';
import {ExpertReportDetails} from './expertReportDetails/expertReportDetails';
import {SentExpertReports} from './sentExpertReports';
import {GenericYesNo} from '../../../../common/form/models/genericYesNo';
import {ExpertCanStillExamine} from './expertCanStillExamine';
import {YesNo} from '../../../../common/form/models/yesNo';

export class Experts {
  expertReportDetails?: ExpertReportDetails;
  sentExpertReports?: SentExpertReports;
  sharedExpert?: GenericYesNo;
  defendantExpertEvidence?: GenericYesNo;
  permissionForExpert?: GenericYesNo;
  expertCanStillExamine?: ExpertCanStillExamine;
  expertDetailsList?: ExpertDetailsList;

  hasExpertReportDetails (): boolean {
    return this.expertReportDetails?.option === YesNo.YES;
  }

  hasPermissionForExpert(): boolean {
    return this.permissionForExpert?.option === YesNo.YES;
  }

  hasEvidenceExpertCanStillExamine(): boolean {
    return this.expertCanStillExamine.option === YesNo.YES;
  }

  hasDefendantExpertEvidence(): boolean {
    return this.defendantExpertEvidence?.option === YesNo.YES;
  }
}
