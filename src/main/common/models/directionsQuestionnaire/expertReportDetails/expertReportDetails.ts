import {IsDefined, ValidateNested, ValidateIf} from 'class-validator';
import {ReportDetails} from './reportDetails';
// import {FREE_TEXT_MAX_LENGTH} from '../../../form/validators/validationConstraints';
import {YesNo} from '../../../form/models/yesNo';

export class ExpertReportDetails {
  @IsDefined({message: 'ERRORS.SELECT_YES_IF_DOCUMENTS'})
    hasExpertReports?: YesNo;

  @ValidateIf(o => o.hasExportReports === YesNo.YES)
  // @IsDefined({message: 'ERRORS.GIVE_DETAILS_DOCUMENTS'})
  // @IsNotEmpty({message: 'ERRORS.GIVE_DETAILS_DOCUMENTS'})
  // @MaxLength(FREE_TEXT_MAX_LENGTH, {message: 'ERRORS.TEXT_TOO_LONG'})
  @ValidateNested({each: true})
    reportDetails?: ReportDetails[];

  constructor(hasExpertReports?: YesNo, reportDetails?: ReportDetails[]) {
    this.hasExpertReports = hasExpertReports;
    this.reportDetails = reportDetails;
  }
}