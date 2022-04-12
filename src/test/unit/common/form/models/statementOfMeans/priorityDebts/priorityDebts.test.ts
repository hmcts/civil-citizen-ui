import {PriorityDebts, DebtsError} from '../../../../../../../main/common/form/models/statementOfMeans/priorityDebts';
import {PriorityDebtDetails} from '../../../../../../../main/common/form/models/statementOfMeans/priorityDebtDetails';
import {validateForm} from '../../../../../../../main/common/form/validators/formValidator';
import {formatFormErrors} from '../../../../../../../main/common/utils/priorityDebts/priorityDebtsConvertors';

describe('Priority debts', () => {
  describe('Validate', () => {
    it('should have no errors when empty form with save and continue', async () => {
      //Given
      const form = new PriorityDebts();
      //When
      await validateForm(form);
      //Then
      expect(form.hasErrors()).toBeFalsy();
    });
    it('should have errors for mortgage when mortgage declared is true', async () => {
      //Given
      const form = new PriorityDebts(
        new PriorityDebtDetails(true, 'Mortgage'),
      );
      //When
      await validateForm(form);
      const errors: DebtsError = formatFormErrors(form.errors);
      //Then
      expect(form.hasErrors()).toBeTruthy();
      expect(Object.keys(errors.mortgage).length).toBe(2);
    });
  });
});
