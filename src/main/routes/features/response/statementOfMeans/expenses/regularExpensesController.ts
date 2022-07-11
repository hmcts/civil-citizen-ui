import express from 'express';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {RegularExpenses} from '../../../../../common/form/models/statementOfMeans/expensesAndIncome/regularExpenses';
import {CITIZEN_MONTHLY_EXPENSES_URL, CITIZEN_MONTHLY_INCOME_URL} from '../../../../urls';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {
  getRegularExpenses,
  saveRegularExpenses,
} from '../../../../../services/features/response/statementOfMeans/expenses/regularExpensesService';
import {toRegularExpenseForm} from '../../../../../common/utils/expenseAndIncome/regularIncomeExpenseCoverter';

const regularExpensesController = express.Router();
const regularExpensesView = 'features/response/statementOfMeans/expenses/regular-expenses';

function renderForm(form: GenericForm<RegularExpenses>, res: express.Response) {
  res.render(regularExpensesView, {form: form});
}

regularExpensesController.get(CITIZEN_MONTHLY_EXPENSES_URL, async (req, res, next: express.NextFunction) => {
  try {
    const model = await getRegularExpenses(req.params.id);
    renderForm(new GenericForm<RegularExpenses>(model), res);
  } catch (error) {
    next(error);
  }
});

regularExpensesController.post(CITIZEN_MONTHLY_EXPENSES_URL, async (req, res, next: express.NextFunction) => {
  const form = new GenericForm(toRegularExpenseForm(req));
  try {
    await form.validate();
    if (form.hasErrors()) {
      renderForm(form, res);
    } else {
      await saveRegularExpenses(req.params.id, form.model);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_MONTHLY_INCOME_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default regularExpensesController;
