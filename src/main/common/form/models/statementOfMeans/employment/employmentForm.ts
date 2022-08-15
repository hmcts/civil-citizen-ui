import {YesNo} from '../../yesNo';
import {IsDefined, ValidateIf} from 'class-validator';
import {EmploymentCategory} from './employmentCategory';

export class EmploymentForm {
  @IsDefined({message: 'ERRORS.VALID_YES_NO_OPTION'})
    option: YesNo;
  @ValidateIf(o => o.optionYesDefined())
  @IsDefined({message: 'ERRORS.VALID_AT_LEAST_ONE_OPTION'})
    employmentCategory: EmploymentCategory[];

  constructor(option?: YesNo, employmentCategory?: EmploymentCategory[]) {
    this.option = option;
    this.employmentCategory = employmentCategory;
  }

  static convertToArray(param: EmploymentCategory[] | EmploymentCategory): EmploymentCategory[] {
    if (Array.isArray(param)) {
      return param;
    }
    if (param) {
      return [param];
    }
  }

  hasEmploymentCategory(value: EmploymentCategory) {
    return this.employmentCategory?.includes(value);
  }

  optionYesDefined(): boolean {
    return this.option === YesNo.YES;
  }

  isSelfEmployed() {
    return this.employmentCategory?.length === 1 && this.employmentCategory[0] === EmploymentCategory.SELF_EMPLOYED;
  }

  isEmployed() {
    return this.employmentCategory?.length === 1 && this.employmentCategory[0] === EmploymentCategory.EMPLOYED;
  }

  isEmployedAndSelfEmployed() {
    return this.employmentCategory?.length && this.employmentCategory.includes(EmploymentCategory.EMPLOYED) && this.employmentCategory.includes(EmploymentCategory.SELF_EMPLOYED);
  }
}
