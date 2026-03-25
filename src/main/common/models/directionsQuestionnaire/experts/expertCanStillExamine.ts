import {IsDefined, IsNotEmpty, MaxLength, ValidateIf} from 'class-validator';
import {FREE_TEXT_MAX_LENGTH} from 'form/validators/validationConstraints';
import {YesNo} from 'form/models/yesNo';

export class ExpertCanStillExamine {
  @IsDefined({message: 'ERRORS.EXPERT_CAN_STILL_EXAMINE_REQUIRED'})
    option?: YesNo;

  @ValidateIf(o => o.option === YesNo.YES)
  @IsDefined({message: 'ERRORS.DEFENDANT_EXPERT_EXPLAIN_EXAMINE'})
  @IsNotEmpty({message: 'ERRORS.DEFENDANT_EXPERT_EXPLAIN_EXAMINE'})
  @MaxLength(FREE_TEXT_MAX_LENGTH, {message: 'ERRORS.TEXT_TOO_LONG'})
    details?: string;

  constructor(option?: YesNo, details?: string) {
    this.option = option;
    this.details = details;
  }
}
