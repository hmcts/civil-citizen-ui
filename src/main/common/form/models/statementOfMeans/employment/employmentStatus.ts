import {Form} from '../../form';
import {YesNo} from '../../yesNo';
import {IsDefined, ValidateIf} from 'class-validator';
import {VALID_AT_LEAST_ONE_OPTION, VALID_YES_NO_OPTION} from '../../../validationErrors/errorMessageConstants';

export class EmploymentStatus extends Form {
  @IsDefined({message: VALID_YES_NO_OPTION})
    option: YesNo;
  @ValidateIf(o => o.optionDefined())
  @IsDefined({message: VALID_AT_LEAST_ONE_OPTION})
    employed: string;
  @ValidateIf(o => o.optionDefined())
  @IsDefined({message: VALID_AT_LEAST_ONE_OPTION})
    selfEmployed: string;

  constructor(option: YesNo, employed?: string, selfEmployed?: string) {
    super();
    this.option = option;
    this.employed = employed;
    this.selfEmployed = selfEmployed;
  }

  optionDefined(): boolean {
    return this.option !== null && this.option !== undefined;
  }
}
