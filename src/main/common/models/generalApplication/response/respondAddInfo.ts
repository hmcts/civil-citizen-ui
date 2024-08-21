import { YesNo } from 'common/form/models/yesNo';
import {IsNotEmpty, ValidateIf} from 'class-validator';

export class RespondAddInfo {

  @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.RESPONDENT_UPLOAD_OPTION.EMPTY_OPTION' })
    option?: YesNo;
  @ValidateIf(o =>  o.option === YesNo.NO || o.additionalText === null)
  @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.RESPONDENT_UPLOAD_OPTION.ERROR_INPUT' })
    additionalText?: string;

  constructor(option?: YesNo, additionalText?: string) {
    this.option = option;
    this.additionalText = additionalText;
  }
}
