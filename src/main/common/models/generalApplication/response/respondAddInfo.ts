import { YesNo } from 'common/form/models/yesNo';
import {IsNotEmpty, ValidateIf} from 'class-validator';

export class RespondAddInfo {
  @ValidateIf(o => !o.option && o.additionalText> 1)
  @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.RESPONDENT_UPLOAD_OPTION.EMPTY_OPTION' })
    option?: YesNo;

  @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.RESPONDENT_UPLOAD_OPTION.ERROR_INPUT' })
    additionalText?: string;

  constructor(option?: YesNo, additionalText?: string) {
    this.option = option;
    this.additionalText = additionalText;
  }
}
