import {
  EmploymentStatus,
} from '../../../../../../../main/common/form/models/statementOfMeans/employment/employmentStatus';
import {Validator} from 'class-validator';
import {YesNo} from '../../../../../../../main/common/form/models/yesNo';
import {
  EmploymentCategory,
} from '../../../../../../../main/common/form/models/statementOfMeans/employment/employmentCategory';

describe('Validate employment status', () => {
  const validator = new Validator();
  it('should have errors when no option is specified', () => {
    //Given
    const form = new EmploymentStatus();
    //When
    const errors = validator.validateSync(form);
    //Then
    expect(errors.length).toBe(1);
    expect(errors[0].constraints?.isDefined).toBeDefined();
  });
  it('should have errors when yes is an option but no employment type is specified', () => {
    //Given
    const form = new EmploymentStatus(YesNo.YES);
    //When
    const errors = validator.validateSync(form);
    //Then
    expect(errors.length).toBe(1);
    expect(errors[0].constraints?.isDefined).toBeDefined();
  });
  it('should have no errors when no is an option but no employment type is specified', () => {
    //Given
    const form = new EmploymentStatus(YesNo.NO);
    //When
    const errors = validator.validateSync(form);
    //Then
    expect(errors.length).toBe(0);
  });
  it('should have no errors when yes is an option and at least one employment type is specified', () => {
    //Given
    const form = new EmploymentStatus(YesNo.NO, [EmploymentCategory.SELF_EMPLOYED]);
    //When
    const errors = validator.validateSync(form);
    //Then
    expect(errors.length).toBe(0);
  });
});
