import {IsDefined, IsNotEmpty, MaxLength, ValidateIf} from 'class-validator';
import {FREE_TEXT_MAX_LENGTH} from '../../../form/validators/validationConstraints';
import {YesNo} from '../../../form/models/yesNo';

export class PhoneOrVideoHearing {
  @IsDefined({message: 'ERRORS.VALID_PHONE_OR_VIDEO_HEARING.YES_NO'})
    option?: YesNo;

  @ValidateIf(o => o.option === YesNo.YES)
  @IsDefined({message: 'ERRORS.VALID_PHONE_OR_VIDEO_HEARING.TELL_US_WHY'})
  @IsNotEmpty({message: 'ERRORS.VALID_PHONE_OR_VIDEO_HEARING.TELL_US_WHY'})
  @MaxLength(FREE_TEXT_MAX_LENGTH, {message: 'ERRORS.TEXT_TOO_LONG'})
    details?: string;

  constructor(option?: YesNo, details?: string) {
    this.option = option;
    this.details = details;
  }
}
