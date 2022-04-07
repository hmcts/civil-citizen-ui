import {ValidationError, Validator} from 'class-validator';
import {PriorityDebtDetails} from '../../../../../../../main/common/form/models/statementOfMeans/priorityDebtDetails';

const validator = new Validator();
describe('Expense', () => {
  describe('Validation', () => {
    it('should have errors when the declared is true', async () => {
      //Given
      const form = new PriorityDebtDetails(true, 'Rent');
      //When
      const errors : ValidationError[] = await validator.validate(form);

      //Then
      // one error block for amount field, one error block for schedule field
      expect(errors.length).toBe(2);
      // checking the errors on amount field
      const errorList = errors[0].constraints;
      // four validation error methods on amount is triggering these errors
      expect(Object.keys(errorList).length).toBe(4);
    });
    
    it('should have one nested error when declared is true and schedule is not set', async () => {
      //Given
      const form = new PriorityDebtDetails(true, 'Rent', 500);
      //When
      const errors = await validator.validate(form);
      const errorList = errors[0].constraints;
      //Then
      expect(errors.length).toBe(1);
      expect(Object.keys(errorList).length).toBe(1);
    });
    it('should have one nested error when declared is true and schedule  is not set', async () => {
      //Given
      const form = new PriorityDebtDetails(true, 'Rent', undefined, 'week');
      //When
      const errors = await validator.validate(form);
      const errorList = errors[0].constraints;
      //Then
      expect(errors.length).toBe(1);
      expect(Object.keys(errorList).length).toBe(4);
    });
  });
});