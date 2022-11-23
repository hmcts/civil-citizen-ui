import {IsDefined, ValidateIf, ValidateNested} from 'class-validator';
import {YesNo} from 'form/models/yesNo';
import {DateOfBirth} from './dateOfBirth';

export class DefendantDOB {
  @IsDefined({message: 'ERRORS.SELECT_AN_OPTION'})
    option?: YesNo;

  @ValidateIf(o => o.option === YesNo.YES)
  @ValidateNested()
    dob?: DateOfBirth;

  constructor(option?: YesNo, dateOfBirth?: DateOfBirth) {
    this.option = option;
    this.dob = option === YesNo.YES ? dateOfBirth : undefined;
  }
}
