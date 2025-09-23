import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {TransactionSource} from 'form/models/statementOfMeans/expensesAndIncome/transactionSource';

@ValidatorConstraint({name: 'OtherExpenditureValidator', async: false})
export class OtherExpenditureValidator implements ValidatorConstraintInterface {

  validate(value: []): boolean {
    value.forEach((transactionSource: TransactionSource) => {
      if (transactionSource.name === '') {
        return false;
      }
    });
    return true;
  }

  defaultMessage() {
    return 'ERRORS.EXPENSES_ENTER_OTHER_SOURCE';
  }
}
