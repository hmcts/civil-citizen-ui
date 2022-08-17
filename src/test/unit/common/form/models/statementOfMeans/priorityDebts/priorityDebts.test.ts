import {PriorityDebts} from '../../../../../../../main/common/form/models/statementOfMeans/priorityDebts';
import {PriorityDebtDetails} from '../../../../../../../main/common/form/models/statementOfMeans/priorityDebtDetails';
import {GenericForm} from '../../../../../../../main/common/form/models/genericForm';
import {
  formatFormErrors,
  listFormErrors,
} from '../../../../../../../main/common/utils/priorityDebts/priorityDebtsConvertors';

describe('Priority debts', () => {
  describe('Validate', () => {
    it('should have no errors when empty form with save and continue', async () => {
      //Given
      const form = new GenericForm(new PriorityDebts());
      //When
      await form.validate();
      //Then
      expect(form.hasErrors()).toBeFalsy();
    });
    it('should have errors for mortgage when mortgage declared is true', async () => {
      //Given
      const form = new GenericForm(new PriorityDebts(
        new PriorityDebtDetails(true, 'Mortgage'),
      ));
      //When
      await form.validate();
      //Then
      const priorityDebtErrors = listFormErrors(formatFormErrors(form.getErrors()));
      expect(form.hasErrors()).toBeTruthy();
      expect(Object.keys(priorityDebtErrors).length).toBe(2);
    });
  });
});
