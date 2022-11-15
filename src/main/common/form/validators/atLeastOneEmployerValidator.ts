import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {Employer} from '../models/statementOfMeans/employment/employer';

@ValidatorConstraint({ name: 'customAtLeastOneEmployerValidator', async: false })
export class AtLeastOneEmployerValidator implements ValidatorConstraintInterface {

  validate(value: Employer[]) {
    let hasAtLeastOneEmployerField = false;
    value.forEach((employer: Employer) => {
      if (employer.employerName !== '' || employer.jobTitle !== '') {
        hasAtLeastOneEmployerField = true;
      }
    });
    return hasAtLeastOneEmployerField;
  }

  defaultMessage() {
    return 'ERRORS.VALID_ENTER_AT_LEAST_ONE_EMPLOYER';
  }
}

