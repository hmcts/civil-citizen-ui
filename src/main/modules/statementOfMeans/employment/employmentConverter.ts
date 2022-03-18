import {Employment} from '../../../common/models/employment';
import {EmploymentStatus} from '../../../common/form/models/statementOfMeans/employment/employmentStatus';
import {YesNo} from '../../../common/form/models/yesNo';

export const convertToForm = (employmentEntity: Employment): EmploymentStatus => {
  if (employmentEntity) {
    return new EmploymentStatus(convertToYesNo(employmentEntity.declared), employmentEntity.employmentType);
  }
  return new EmploymentStatus();
};

export const convertFromForm = (employmentForm: EmploymentStatus): Employment => {
  if (employmentForm) {
    return {
      declared: (convertFromYesNo(employmentForm.option)),
      employmentType: employmentForm.employmentCategory,
    };
  }
};

const convertToYesNo = (declared: boolean): YesNo => {
  let convertedYesNoValue = undefined;
  if (declared === true) {
    convertedYesNoValue = YesNo.YES;
  } else if (declared === false) {
    convertedYesNoValue = YesNo.NO;
  }
  return convertedYesNoValue;
};

const convertFromYesNo = (option: YesNo): boolean => {
  if (option) {
    switch (option) {
      case YesNo.YES:
        return true;
      case YesNo.NO:
        return false;
    }
  }
};

