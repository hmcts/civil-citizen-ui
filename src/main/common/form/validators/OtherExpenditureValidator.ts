import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {OtherTransaction} from 'form/models/statementOfMeans/expensesAndIncome/otherTransaction';
import {TransactionSource} from 'form/models/statementOfMeans/expensesAndIncome/transactionSource';

@ValidatorConstraint({name: 'OtherExpenditureValidator', async: false})
export class OtherExpenditureValidator implements ValidatorConstraintInterface {

  validate(value: OtherTransaction): boolean {
    value.transactionSources.forEach((transactionSource: TransactionSource) => {
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
