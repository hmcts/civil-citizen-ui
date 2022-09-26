import {IsDefined, ValidateNested, ValidateIf} from 'class-validator';
import {ReportDetail} from './reportDetail';
import {YesNo} from '../../../../form/models/yesNo';
import {AtLeastOneRowIsPopulated} from '../../../../form/validators/atLeastOneRowIsPopulated';

export class ExpertReportDetails {
  @IsDefined({message: 'ERRORS.VALID_YES_NO_SELECTION'})
    hasExpertReports: YesNo;

  @ValidateIf(o => o.hasExpertReports === YesNo.YES)
  @ValidateNested()
  @AtLeastOneRowIsPopulated({message: 'ERRORS.ENTER_AT_LEAST_ONE_REPORT'})
    reportDetails?: ReportDetail[];

  constructor(hasExpertReports?: YesNo, reportDetails?: ReportDetail[]) {
    this.hasExpertReports = hasExpertReports;
    this.reportDetails = reportDetails;
  }

  public static buildEmptyForm(): ExpertReportDetails {
    return new ExpertReportDetails(undefined, [new ReportDetail('', '', '', '')]);
  }

  public static removeEmptyReportDetails(expertReportDetails: ExpertReportDetails): ExpertReportDetails {
    const filteredReportDetails = expertReportDetails.reportDetails?.filter(reportDetail => !reportDetail.isEmpty());
    return {...expertReportDetails, reportDetails: filteredReportDetails};
  }
}
