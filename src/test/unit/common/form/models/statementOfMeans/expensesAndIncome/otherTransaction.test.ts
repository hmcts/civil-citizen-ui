import {
  OtherTransaction,
  OtherTransactionRequestParams,
} from 'form/models/statementOfMeans/expensesAndIncome/otherTransaction';
import {TransactionSchedule} from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';

describe('OtherTransaction.buildPopulatedForm', () => {
  describe('should build populated form with valid input', () => {
    // Given
    const input: OtherTransactionRequestParams[] = [
      {name: 'Electricity', amount: '100', schedule: TransactionSchedule.MONTH},
      {name: 'Water', amount: '50', schedule: TransactionSchedule.WEEK},
    ];
    const isIncome = false;

    test('Testing of otherTransaction class', () => {

      // When
      const result = OtherTransaction.buildPopulatedForm(input, isIncome);

      // Then
      expect(result.declared).toBe(true);
      expect(result.transactionSources).toHaveLength(2);
      expect(result.transactionSources[0]).toEqual(
        expect.objectContaining({
          name: 'Electricity',
          amount: 100,
          schedule: 'MONTH',
          isIncome: false,
          nameRequired: true,
        }),
      );
      expect(result.transactionSources[1]).toEqual(
        expect.objectContaining({
          name: 'Water',
          amount: 50,
          schedule: 'WEEK',
          isIncome: false,
          nameRequired: true,
        }),
      );
    });

    test('should build empty form when no input is provided', () => {
      // Given
      const isIncome = true;

      // When
      const result = OtherTransaction.buildPopulatedForm([], isIncome);

      // Then
      expect(result.declared).toBe(true);
      expect(result.transactionSources).toHaveLength(0);
    });

    test('should handle invalid or missing input gracefully', () => {
      // Given
      const input: OtherTransactionRequestParams[] = [
        {name: 'InvalidTransaction'},
        {name: null, amount: '150', schedule: TransactionSchedule.TWO_WEEKS},
      ];
      const isIncome = true;

      // When
      const result = OtherTransaction.buildPopulatedForm(input, isIncome);

      // Then
      expect(result.declared).toBe(true);
      expect(result.transactionSources).toHaveLength(2);
      expect(result.transactionSources[0]).toEqual(
        expect.objectContaining(
          {
            'amount': undefined,
            'isIncome': true,
            'name': 'InvalidTransaction',
            'nameRequired': true,
            'schedule': undefined,
          }));
    });
  });
});

