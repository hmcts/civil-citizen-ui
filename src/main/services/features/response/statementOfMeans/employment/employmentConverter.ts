import {Employment} from 'common/models/employment';
import {EmploymentForm} from 'common/form/models/statementOfMeans/employment/employmentForm';
import {convertFromYesNo, convertToYesNo} from 'common/utils/yesNoOptionConverter';
import {GenericForm} from 'common/form/models/genericForm';

export const convertToForm = (employmentEntity: Employment): GenericForm<EmploymentForm> => {
  if (employmentEntity) {
    return new GenericForm(new EmploymentForm(convertToYesNo(employmentEntity.declared), employmentEntity.employmentType));
  }
  return new GenericForm(new EmploymentForm());
};

export const convertFromForm = (employmentForm: GenericForm<EmploymentForm>): Employment => {
  if (employmentForm) {
    return {
      declared: (convertFromYesNo(employmentForm.model.option)),
      employmentType: employmentForm.model.employmentCategory,
    };
  }
};
