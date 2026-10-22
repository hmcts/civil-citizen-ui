import {GenericForm} from 'common/form/models/genericForm';
import {DebtItems} from 'form/models/statementOfMeans/debts/debtItems';

describe('DebtItems', () => {
  describe('constructor', () => {
    it('should assign debt fields', () => {
      const item = new DebtItems('Credit card', '100.00', '10.00');

      expect(item.debt).toBe('Credit card');
      expect(item.totalOwned).toBe('100.00');
      expect(item.monthlyPayments).toBe('10.00');
    });
  });

  describe('isEmpty and isAtLeastOneFieldPopulated', () => {
    it('should treat blank values as empty', () => {
      const item = new DebtItems('', '', '');

      expect(item.isEmpty()).toBe(true);
      expect(item.isAtLeastOneFieldPopulated()).toBe(false);
    });

    it('should treat any populated field as not empty', () => {
      expect(new DebtItems('Loan', '', '').isEmpty()).toBe(false);
      expect(new DebtItems('', '1', '').isAtLeastOneFieldPopulated()).toBe(true);
      expect(new DebtItems('', '', '2').isAtLeastOneFieldPopulated()).toBe(true);
    });
  });

  describe('validation', () => {
    it('should not validate empty rows', async () => {
      const form = new GenericForm(new DebtItems('', '', ''));

      await form.validate();

      expect(form.hasErrors()).toBeFalsy();
    });

    it('should pass for a fully populated valid row', async () => {
      const form = new GenericForm(new DebtItems('Loan', '100.00', '10.00'));

      await form.validate();

      expect(form.hasErrors()).toBeFalsy();
    });

    it('should require debt and positive currency amounts when populated', async () => {
      const form = new GenericForm(new DebtItems('', '-1', ''));

      await form.validate();

      expect(form.errorFor('debt')).toBe('ERRORS.ENTER_A_DEBT');
      expect(form.errorFor('totalOwned')).toBeTruthy();
      expect(form.errorFor('monthlyPayments')).toBe('ERRORS.VALID_STRICTLY_POSITIVE_NUMBER');
    });
  });
});
