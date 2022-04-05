import express from 'express';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {RegularExpenses} from '../../../../../common/form/models/statementOfMeans/expenses/regularExpenses';
import {CITIZEN_MONTHLY_EXPENSES_URL} from '../../../../urls';
import Expense from '../../../../../common/form/models/statementOfMeans/expenses/expense';

const regularExpensesController = express.Router();
const regularExpensesView = 'features/response/statementOfMeans/expenses/regular-expenses';

function renderForm(form: GenericForm<RegularExpenses>, res: express.Response) {
  res.render(regularExpensesView, {form: form});
}

function toForm(req: express.Request): RegularExpenses {
  const regularExpenses = RegularExpenses.buildEmptyForm();
  if (req.body.declared) {
    req.body.declared.forEach((expenseName: string) => {
      const expense = Expense.buildPopulatedForm(req.body.model[expenseName].expenseSource.name, req.body.model[expenseName].expenseSource.amount, req.body.model[expenseName].expenseSource.schedule);
      regularExpenses[expenseName] = expense;
      console.log(regularExpenses);
    });
  }
  return regularExpenses;
}

regularExpensesController.get(CITIZEN_MONTHLY_EXPENSES_URL, (req, res) => {
  renderForm(new GenericForm<RegularExpenses>(RegularExpenses.buildEmptyForm()), res);
});

regularExpensesController.post(CITIZEN_MONTHLY_EXPENSES_URL, async (req, res) => {
  const form = new GenericForm(toForm(req));
  await form.validate();
  if(form.hasErrors()) {
    renderForm(form, res);
  }
});
export default regularExpensesController;
