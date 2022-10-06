import {IsDefined, ValidateIf, ValidateNested} from 'class-validator';
import {ReportDetail} from './reportDetail';
import {YesNo} from '../../../../form/models/yesNo';
import {AtLeastOneRowIsPopulated} from '../../../../form/validators/atLeastOneRowIsPopulated';

export class ExpertReportDetails {
  @IsDefined({message: 'ERRORS.VALID_YES_NO_SELECTION'})
    option: YesNo;

  @ValidateIf(o => o.option === YesNo.YES)
  @ValidateNested()
  @AtLeastOneRowIsPopulated({message: 'ERRORS.ENTER_AT_LEAST_ONE_REPORT'})
    reportDetails?: ReportDetail[];

  constructor(option?: YesNo, reportDetails?: ReportDetail[]) {
    this.option = option;
    this.reportDetails = reportDetails;
  }

  public static removeEmptyReportDetails(expertReportDetails: ExpertReportDetails): ExpertReportDetails {
    const filteredReportDetails = expertReportDetails.reportDetails?.filter(reportDetail => !reportDetail.isEmpty());
    return {...expertReportDetails, reportDetails: filteredReportDetails};
  }
}
