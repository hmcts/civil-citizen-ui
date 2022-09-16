import {YesNo} from '../../form/models/yesNo';
import {IsDefined} from 'class-validator';

export class DefendantExpertEvidence {
  @IsDefined({message: 'ERRORS.DEFENDANT_EXPERT_EVIDENCE_REQUIRED'})
    option?: YesNo;

  constructor(option?: YesNo, details?: string) {
    this.option = option;
  }
}
