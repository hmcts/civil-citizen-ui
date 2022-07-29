import {Validate, ValidateNested} from 'class-validator';
import {Employer} from './employer';
import {AtLeastOneEmployerValidator} from '../../../../../common/form/validators/atLeastOneEmployerValidator';

export class Employers {

  @Validate(AtLeastOneEmployerValidator, { message: 'ERRORS.VALID_ENTER_AT_LEAST_ONE_EMPLOYER' })
  @ValidateNested()
    rows: Employer[];

  constructor(rows?: Employer[]) {
    this.rows = rows;
  }
}
