import {Form} from '../../form';
import {YesNo} from '../../yesNo';
import {IsDefined, ValidateIf} from 'class-validator';
import {VALID_AT_LEAST_ONE_OPTION, VALID_YES_NO_OPTION} from '../../../validationErrors/errorMessageConstants';
import {EmploymentCategory} from 'common/form/models/statementOfMeans/employment/employmentCategory';

export class EmploymentStatus extends Form {
  @IsDefined({message: VALID_YES_NO_OPTION})
    option: YesNo;
  @ValidateIf(o => o.optionYesDefined())
  @IsDefined({message: VALID_AT_LEAST_ONE_OPTION})
    employmentCategory: EmploymentCategory[];

  constructor(option?: YesNo, employmentCategory?: EmploymentCategory[]) {
    super();
    this.option = option;
    this.employmentCategory = employmentCategory;
  }

  static convertToArray(param: any): EmploymentCategory[] {
    if (!Array.isArray(param)) {
      return [param];
    }
    return param;
  }

  optionYesDefined(): boolean {
    return this.option === YesNo.YES;
  }
}
