import {IsDefined, ValidateIf, ValidateNested} from 'class-validator';
import {YesNo} from '../../../form/models/yesNo';
import {CitizenDate} from '../../../form/models/claim/claimant/citizenDate';

export class DefendantDOB {
  @IsDefined({message: 'ERRORS.SELECT_AN_OPTION'})
    option?: YesNo;

  @ValidateIf(o => o.option === YesNo.YES)
  @ValidateNested()
    dob?: CitizenDate;

  constructor(option?: YesNo, dateOfBirth?: CitizenDate) {
    this.option = option;
    this.dob = option === YesNo.YES ? dateOfBirth : undefined;
  }
}
