import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {EmploymentCategory} from 'form/models/statementOfMeans/employment/employmentCategory';
import {CCDEmploymentOption} from 'models/ccdResponse/ccdEmploymentOption';
import {Employment} from 'models/employment';
import {toCUIBoolean} from 'services/translation/convertToCUI/convertToCUIYesNo';

export const toCUIEmployment = (employmentDeclared: YesNoUpperCamelCase, employmentTypeList : string[]): Employment => {
  if (!employmentDeclared) return undefined;
  let cuiEmploymentTypeList = undefined;
  if (employmentTypeList?.length) {
    cuiEmploymentTypeList = employmentTypeList.map((employmentType: CCDEmploymentOption) => {
      return toCUIEmploymentOption(employmentType);
    });
  }
  return {
    declared: toCUIBoolean(employmentDeclared),
    employmentType: cuiEmploymentTypeList,
  };
};

const toCUIEmploymentOption = (option: CCDEmploymentOption): EmploymentCategory => {
  switch (option) {
    case CCDEmploymentOption.SELF:
      return EmploymentCategory.SELF_EMPLOYED;
    case CCDEmploymentOption.EMPLOYED:
      return EmploymentCategory.EMPLOYED;
  }
};
