import { ValidateNested } from 'class-validator';
// import { FormValidationError } from 'common/form/validationErrors/formValidationError';
// import { Employer } from 'common/models/employer';
import { VALID_ENTER_AT_LEAST_ONE_EMPLOYER } from '../../../validationErrors/errorMessageConstants';
import { Form } from '../../form';
import { Employer } from './employer';
import { FormValidationError } from 'common/form/validationErrors/formValidationError';

export class Employers extends Form {

  @ValidateNested({ message: VALID_ENTER_AT_LEAST_ONE_EMPLOYER })
  rows: Employer[];

  constructor(rows?: Employer[]) {
    super();
    this.rows = rows;
  }

  public getFormErrors(): FormValidationError[] {
    let formErrors = super.getErrors();
    if (this.hasEmployers() && this.hasErrors()) {
      this.rows.forEach((employer, i) => {
        formErrors = formErrors.concat(employer.getErrors('rows[' + i + ']'));
      });
    }
    return formErrors;
  }

  public getOnlyCompletedAccounts(): Employer[] {
    if (this.hasEmployers()) {
      return this.rows.filter(employer => employer.employerName !== '' && employer.jobTitle !== '');
    }
  }

  private hasEmployers() {
    return this.rows && this.rows.length > 0;
  }

  public addEmptyRowsIfNotEnough() {
    if (this.rows.length) {
      this.rows.push(new Employer());
    }
  }
}
