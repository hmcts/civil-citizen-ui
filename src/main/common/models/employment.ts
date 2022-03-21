import {EmploymentCategory} from '../../common/form/models/statementOfMeans/employment/employmentCategory';

export interface Employment {
  declared: boolean;
  employmentType: EmploymentCategory[];
}
