import {EmploymentCategory} from 'form/models/statementOfMeans/employment/employmentCategory';
import {CCDEmploymentOption} from "models/ccdResponse/ccdEmploymentOption";

export const toCCDEmploymentSelection = (employmentType: EmploymentCategory[]): string[] => {
  if (!employmentType?.length) return undefined;
  const ccdEmploymentTypeList: string[] = [];
  employmentType.forEach((employmentTypeItem) => {
    ccdEmploymentTypeList.push(toCCDEmploymentOption(employmentTypeItem));
  });
  return ccdEmploymentTypeList;
};

const toCCDEmploymentOption = (option: EmploymentCategory): CCDEmploymentOption => {
  switch (option) {
    case EmploymentCategory.SELF_EMPLOYED:
      return CCDEmploymentOption.SELF;
    case EmploymentCategory.EMPLOYED:
      return CCDEmploymentOption.EMPLOYED;
    default:
      return undefined;
  }
}
