import * as express from 'express';
import {
  toRegularExpenseForm,
  toRegularIncomeForm,
} from '../../../../../main/common/utils/expenseAndIncome/regularIncomeExpenseCoverter';
import {
  TransactionSchedule,
} from '../../../../../main/common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule';

describe('regular income converter', () => {
  describe('convert to regular expenses form', () => {
    it('should convert request body successfully when declared is not empty', () => {
      //Given
      const req = express.request;
      req.body = {
        declared: 'mortgage', model: {
          mortgage: {
            transactionSource:
              {
                name: 'mortgage', amount: '', schedule: undefined,
              },
          },
        },
      };
      //When
      const form = toRegularExpenseForm(req);
      //Then
      expect(form).not.toBeUndefined();
      expect(form?.mortgage?.declared).toBeTruthy();
    });
    it('should not convert when declared is empty', () => {
      const req = express.request;
      req.body = {
        declared: undefined, model: {
          mortgage: {
            transactionSource:
              {
                name: 'mortgage', amount: '', schedule: undefined,
              },
          },
        },
      };
      //When
      const form = toRegularExpenseForm(req);
      //Then
      expect(form).not.toBeUndefined();
      expect(form?.mortgage?.declared).toBeFalsy();
    });
  });
  describe('convert to regular income form', () => {
    it('should convert request body successfully when declared is not empty', () => {
      //Given
      const req = express.request;
      req.body = {
        declared: ['job', 'universalCredit'], model: {
          job: {
            transactionSource:
              {
                name: 'job', amount: '123', schedule: 'WEEK',
              },
          },
          universalCredit: {
            transactionSource:
              {
                name: 'universalCredit', amount: '20', schedule: 'MONTH',
              },
          },
        },
      };
      //When
      const form = toRegularIncomeForm(req);
      //Then
      expect(form).not.toBeUndefined();
      expect(form.job.declared).toBeTruthy();
      expect(form.job.transactionSource.amount).toBe(123);
      expect(form.job.transactionSource.schedule).toBe(TransactionSchedule.WEEK);
      expect(form.universalCredit.declared).toBeTruthy();
      expect(form.universalCredit.transactionSource.amount).toBe(20);
      expect(form.universalCredit.transactionSource.schedule).toBe(TransactionSchedule.MONTH);
    });
  });
});
