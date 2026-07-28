import {ValidateNested} from 'class-validator';
import {Employer} from './employer';
import {AtLeastOneRowIsPopulated} from '../../../../../common/form/validators/atLeastOneRowIsPopulated';

export class Employers {
  @AtLeastOneRowIsPopulated( { message: 'ERRORS.VALID_ENTER_AT_LEAST_ONE_EMPLOYER' })
  @ValidateNested()
    rows: Employer[];

  constructor(rows?: Employer[]) {
    this.rows = rows;
  }

}
