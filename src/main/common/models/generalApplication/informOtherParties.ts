import { IsDefined, IsNotEmpty, ValidateIf } from 'class-validator';
import { GenericYesNo } from 'common/form/models/genericYesNo';
import { YesNo } from 'common/form/models/yesNo';

export class InformOtherParties extends GenericYesNo {

  @ValidateIf(o => o.option == YesNo.NO)
  @IsDefined({ message: 'ERRORS.GENERAL_APPLICATION.EXPLAIN_DO_NOT_WANT_COURT' })
  @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.EXPLAIN_DO_NOT_WANT_COURT' })
    reasonForCourtNotInformingOtherParties?: string;

  constructor(option?: string, reasonForCourtNotInformingOtherParties?: string) {
    super(option, 'ERRORS.GENERAL_APPLICATION.NEED_TO_TELL');
    this.reasonForCourtNotInformingOtherParties = reasonForCourtNotInformingOtherParties;
  }
}
