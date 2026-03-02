import { IsDefined, IsNotEmpty, ValidateIf, Validate } from 'class-validator';
import { GenericYesNo } from 'common/form/models/genericYesNo';
import { YesNo } from 'common/form/models/yesNo';
import { HtmlValidator } from 'common/form/validators/htmlValidator';

export class RespondentAgreement extends GenericYesNo {

  @ValidateIf(o => o.option == YesNo.NO)
  @IsDefined({ message: 'ERRORS.GENERAL_APPLICATION.RESPONDENT_AGREEMENT.EXPLAIN_WHY_DISAGREE_APPLICATION' })
  @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.RESPONDENT_AGREEMENT.EXPLAIN_WHY_DISAGREE_APPLICATION' })
  @Validate(HtmlValidator)
    reasonForDisagreement?: string;

  constructor(option?: string, reasonForDisagreement?: string) {
    super(option, 'ERRORS.GENERAL_APPLICATION.RESPONDENT_AGREEMENT.NEED_TO_TELL');
    this.reasonForDisagreement = reasonForDisagreement;
  }
}
