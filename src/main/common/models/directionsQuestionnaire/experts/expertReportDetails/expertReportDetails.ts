import {IsDefined, ValidateIf, ValidateNested} from 'class-validator';
import {ReportDetail} from './reportDetail';
import {YesNo} from 'form/models/yesNo';
import {AtLeastOneRowIsPopulated} from 'form/validators/atLeastOneRowIsPopulated';

export class ExpertReportDetails {

  isClaimant?: boolean;

  @IsDefined({message: 'ERRORS.EXPERT_REPORT_DETAILS_REQUIRED'})
    option: YesNo;

  @ValidateIf(o => o.option === YesNo.YES && !o.isClaimant)
  @ValidateNested()
  @AtLeastOneRowIsPopulated({message: 'ERRORS.ENTER_AT_LEAST_ONE_REPORT'})
    reportDetails?: ReportDetail[];

  constructor(isClaimant?: boolean, option?: YesNo, reportDetails?: ReportDetail[]) {
    this.isClaimant = isClaimant;
    this.option = option;
    this.reportDetails = reportDetails;
  }

  public static removeEmptyReportDetails(expertReportDetails: ExpertReportDetails): ExpertReportDetails {
    const filteredReportDetails = expertReportDetails.reportDetails?.filter(reportDetail => !reportDetail.isEmpty());
    return {...expertReportDetails, reportDetails: filteredReportDetails};
  }

}
