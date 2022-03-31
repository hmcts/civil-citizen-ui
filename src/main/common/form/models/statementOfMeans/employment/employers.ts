import { ArrayNotEmpty } from 'class-validator';
import { Employer } from 'common/models/employer';
import { VALID_ENTER_AT_LEAST_ONE_EMPLOYER } from '../../../validationErrors/errorMessageConstants';
import { EmployerForm } from './employerForm';

export class Employers {

  @ArrayNotEmpty({ message: VALID_ENTER_AT_LEAST_ONE_EMPLOYER })
  employers: EmployerForm[]

  constructor(employers?: Employer[]) {
    this.employers = employers;
  }

}
