import {IsDefined, IsNotEmpty, MaxLength, ValidateIf} from 'class-validator';
import {FREE_TEXT_MAX_LENGTH} from '../../../form/validators/validationConstraints';
import {YesNo} from '../../../form/models/yesNo';

export class ConsiderClaimantDocuments {
  @IsDefined({message: 'ERRORS.SELECT_YES_IF_DOCUMENTS'})
    option?: YesNo;

  @ValidateIf(o => o.option === YesNo.YES)
  @IsDefined({message: 'ERRORS.GIVE_DETAILS_DOCUMENTS'})
  @IsNotEmpty({message: 'ERRORS.GIVE_DETAILS_DOCUMENTS'})
  @MaxLength(FREE_TEXT_MAX_LENGTH, {message: 'ERRORS.TEXT_TOO_LONG'})
    details?: string;

  constructor(option?: YesNo, details?: string) {
    this.option = option;
    this.details = details;
  }
}
