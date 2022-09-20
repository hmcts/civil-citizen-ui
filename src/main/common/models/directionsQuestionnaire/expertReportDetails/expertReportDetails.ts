import {IsDefined, ValidateNested, ValidateIf} from 'class-validator';
import {ReportDetails} from './reportDetails';
// import {FREE_TEXT_MAX_LENGTH} from '../../../form/validators/validationConstraints';
import {YesNo} from '../../../form/models/yesNo';
import {AtLeastOneRowIsPopulated} from '../../../../common/form/validators/atLeastOneRowIsPopulated';

export class ExpertReportDetails {
  // TODO ; check this out
  @IsDefined({message: 'ERRORS.VALID_YES_NO_SELECTION'})
    hasExpertReports?: YesNo;

  @ValidateIf(o => o.hasExportReports === YesNo.YES)
  // @IsDefined({message: 'ERRORS.GIVE_DETAILS_DOCUMENTS'})
  // @IsNotEmpty({message: 'ERRORS.GIVE_DETAILS_DOCUMENTS'})
  // @MaxLength(FREE_TEXT_MAX_LENGTH, {message: 'ERRORS.TEXT_TOO_LONG'})
  // check the error message check the other validator -- AtLeastOnePopulatedRow --
  @ValidateNested({each: true})
  @AtLeastOneRowIsPopulated({message: 'ERRORS.VALID_ENTER_AT_LEAST_ONE_COURT_ORDER'})
    reportDetails?: ReportDetails[];

  constructor(hasExpertReports?: YesNo, reportDetails?: ReportDetails[]) {
    this.hasExpertReports = hasExpertReports;
    this.reportDetails = reportDetails;
  }
}