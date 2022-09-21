import {IsDefined, ValidateNested, ValidateIf} from 'class-validator';
import {ReportDetails} from './reportDetails';
import {YesNo} from '../../../form/models/yesNo';
import {AtLeastOneRowIsPopulated} from '../../../../common/form/validators/atLeastOneRowIsPopulated';

export class ExpertReportDetails {
  @IsDefined({message: 'ERRORS.VALID_YES_NO_SELECTION'})
    hasExpertReports: YesNo;

  @ValidateIf(o => o.hasExpertReports === YesNo.YES)
  @ValidateNested()
  @AtLeastOneRowIsPopulated({message: 'ERRORS.ENTER_AT_LEAST_ONE_REPORT'})
    reportDetails?: ReportDetails[];

  constructor(hasExpertReports?: YesNo, reportDetails?: ReportDetails[]) {
    this.hasExpertReports = hasExpertReports;
    this.reportDetails = reportDetails;
  }
}