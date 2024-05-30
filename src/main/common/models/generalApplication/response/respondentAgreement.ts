import { IsDefined, IsNotEmpty, ValidateIf } from 'class-validator';
import { GenericYesNo } from 'common/form/models/genericYesNo';
import { YesNo } from 'common/form/models/yesNo';

export class RespondentAgreement extends GenericYesNo {

  @ValidateIf(o => o.option == YesNo.NO)
  @IsDefined({ message: 'ERRORS.GENERAL_APPLICATION.RESPONDENT_AGREEMENT.EXPLAIN_WHY_DISAGREE_APPLICATION' })
  @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.RESPONDENT_AGREEMENT.EXPLAIN_WHY_DISAGREE_APPLICATION' })
    reasonForDisagreement?: string;

  constructor(option?: string, reasonForDisagreement?: string) {
    super(option, 'ERRORS.GENERAL_APPLICATION.RESPONDENT_AGREEMENT.NEED_TO_TELL');
    this.reasonForDisagreement = reasonForDisagreement;
  }
}
