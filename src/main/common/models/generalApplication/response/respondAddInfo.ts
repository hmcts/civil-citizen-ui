import { YesNo } from 'common/form/models/yesNo';
import {IsNotEmpty, Validate, ValidateIf} from 'class-validator';
import {
  RespondAddInfoValidator,
} from 'form/validators/respondAddInfoValidator';

export class RespondAddInfo {
  @Validate(RespondAddInfoValidator, ['additionalText'])
    option?: YesNo;

  @ValidateIf(o => o.option === YesNo.NO && (o.additionalText === null || o.additionalText === undefined || o.additionalText.length < 1))
  @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.RESPONDENT_UPLOAD_OPTION.ERROR_INPUT' })
    additionalText?: string;

  constructor(option?: YesNo, additionalText?: string) {
    this.option = option;
    this.additionalText = additionalText;
  }
}
