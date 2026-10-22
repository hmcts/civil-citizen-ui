import {convertFromForm, convertToForm} from 'services/features/response/statementOfMeans/employment/employmentConverter';
import {Employment} from 'models/employment';
import {EmploymentForm} from 'form/models/statementOfMeans/employment/employmentForm';
import {EmploymentCategory} from 'form/models/statementOfMeans/employment/employmentCategory';
import {YesNo} from 'form/models/yesNo';
import {GenericForm} from 'form/models/genericForm';

describe('employmentConverter', () => {
  describe('convertToForm', () => {
    it('should convert employment entity to form when declared', () => {
      const employment: Employment = {
        declared: true,
        employmentType: [EmploymentCategory.EMPLOYED],
      };

      const result = convertToForm(employment);

      expect(result.model.option).toEqual(YesNo.YES);
      expect(result.model.employmentCategory).toEqual([EmploymentCategory.EMPLOYED]);
    });

    it('should convert employment entity when not declared', () => {
      const employment: Employment = {
        declared: false,
        employmentType: [],
      };

      const result = convertToForm(employment);

      expect(result.model.option).toEqual(YesNo.NO);
    });

    it('should return empty form when entity is undefined', () => {
      const result = convertToForm(undefined);

      expect(result.model.option).toBeUndefined();
    });
  });

  describe('convertFromForm', () => {
    it('should convert form to employment entity when yes', () => {
      const form = new GenericForm(new EmploymentForm(YesNo.YES, [EmploymentCategory.SELF_EMPLOYED]));

      const result = convertFromForm(form);

      expect(result.declared).toEqual(true);
      expect(result.employmentType).toEqual([EmploymentCategory.SELF_EMPLOYED]);
    });

    it('should convert form to employment entity when no', () => {
      const form = new GenericForm(new EmploymentForm(YesNo.NO, []));

      const result = convertFromForm(form);

      expect(result.declared).toEqual(false);
    });

    it('should return undefined when form is undefined', () => {
      const result = convertFromForm(undefined);

      expect(result).toBeUndefined();
    });
  });
});
