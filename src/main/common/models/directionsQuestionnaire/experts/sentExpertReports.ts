import {IsDefined} from 'class-validator';
import {YesNoNotReceived} from 'form/models/yesNo';

export class SentExpertReports {
  @IsDefined({message: 'ERRORS.VALID_SENT_EXPERT_REPORTS'})
    option?: YesNoNotReceived;

  constructor(option?: YesNoNotReceived) {
    this.option = option;
  }
}
