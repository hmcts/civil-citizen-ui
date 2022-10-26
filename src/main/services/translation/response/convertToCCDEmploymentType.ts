import { CCDEmploymentType } from '../../../common/models/ccdResponse/ccdEmploymentType';
import { EmploymentCategory } from '../../../common/form/models/statementOfMeans/employment/employmentCategory';

export const toCCDEmploymentType = (employmentTypeList: EmploymentCategory[]): CCDEmploymentType[] => {
  let ccdEmploymentType: CCDEmploymentType[] = [];
  employmentTypeList.forEach(employmentType => {
    switch (employmentType) {
      case EmploymentCategory.EMPLOYED:
        ccdEmploymentType.push(CCDEmploymentType.EMPLOYED);
        break;
      case EmploymentCategory.SELF_EMPLOYED:
        ccdEmploymentType.push(CCDEmploymentType.SELF);
        break;
    }
  });
  return ccdEmploymentType;
};
