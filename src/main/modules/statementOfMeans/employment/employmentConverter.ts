import {Employment} from '../../../common/models/employment';
import {EmploymentForm} from '../../../common/form/models/statementOfMeans/employment/employmentForm';
import {convertFromYesNo, convertToYesNo} from '../../../common/utils/convertYesNoOption';

export const convertToForm = (employmentEntity: Employment): EmploymentForm => {
  if (employmentEntity) {
    return new EmploymentForm(convertToYesNo(employmentEntity.declared), employmentEntity.employmentType);
  }
  return new EmploymentForm();
};

export const convertFromForm = (employmentForm: EmploymentForm): Employment => {
  if (employmentForm) {
    return {
      declared: (convertFromYesNo(employmentForm.option)),
      employmentType: employmentForm.employmentCategory,
    };
  }
};



