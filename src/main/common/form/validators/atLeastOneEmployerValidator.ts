import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Employer } from '../models/statementOfMeans/employment/employer';
import { VALID_ENTER_AT_LEAST_ONE_EMPLOYER } from '../validationErrors/errorMessageConstants';

@ValidatorConstraint({ name: 'customAtLeastOneEmployerValidator', async: false })
export class AtLeastOneEmployerValidator implements ValidatorConstraintInterface {

    validate(value: any) {

        // return false // SHOW ERROR
        // return true // OK

        let hasAtLeastOneEmployerField = false

        // TOD: Do we need that?
        // if (value === undefined) {
        //     return true;
        // }

        value.forEach((employer: Employer) => {
            if (employer.employerName !== '' || employer.jobTitle !== '') {
                hasAtLeastOneEmployerField = true;
            }
        })
        return hasAtLeastOneEmployerField;
    }

    defaultMessage() {
        return VALID_ENTER_AT_LEAST_ONE_EMPLOYER;
    }

}

