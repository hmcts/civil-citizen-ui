import { YesNo } from 'common/form/models/yesNo';
import {IsNotEmpty, ValidateIf} from 'class-validator';

export class RespondAddInfo {
  @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.ERROR_ACCEPT' })
    option?: YesNo;

  @ValidateIf(o => o.option === YesNo.NO && o.additionalText.length === 0, { message: 'ERRORS.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.ERROR_ACCEPT' })
    additionalText?: string;

  constructor(option?: YesNo, additionalText?: string) {
    this.option = option;
    this.additionalText = additionalText;
  }
}