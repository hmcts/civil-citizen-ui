import express from 'express';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {RegularExpenses} from '../../../../../common/form/models/statementOfMeans/expenses/regularExpenses';
import {CITIZEN_MONTHLY_EXPENSES_URL, CITIZEN_MONTHLY_INCOME_URL} from '../../../../urls';
import Expense from '../../../../../common/form/models/statementOfMeans/expenses/expense';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {
  getRegularExpenses,
  saveRegularExpenses,
} from '../../../../../modules/statementOfMeans/expenses/regularExpensesService';

const regularExpensesController = express.Router();
const regularExpensesView = 'features/response/statementOfMeans/expenses/regular-expenses';

function renderForm(form: GenericForm<RegularExpenses>, res: express.Response) {
  res.render(regularExpensesView, {form: form});
}

function toForm(req: express.Request): RegularExpenses {
  const regularExpenses = RegularExpenses.buildEmptyForm();
  if (req.body.declared) {
    if (Array.isArray(req.body.declared)) {
      req.body.declared.forEach((expenseName: string) => {
        updateFormWithResponseData(expenseName, req, regularExpenses);
      });
    } else {
      updateFormWithResponseData(req.body.declared, req, regularExpenses);
    }
  }
  return regularExpenses;
}

function updateFormWithResponseData(key: string, req: express.Request, regularExpenses: RegularExpenses) {
  regularExpenses[key] = Expense.buildPopulatedForm(req.body.model[key].expenseSource.name, req.body.model[key].expenseSource.amount, req.body.model[key].expenseSource.schedule);
}

regularExpensesController.get(CITIZEN_MONTHLY_EXPENSES_URL, async (req, res) => {
  try {
    const model = await getRegularExpenses(req.params.id);
    renderForm(new GenericForm<RegularExpenses>(model), res);
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

regularExpensesController.post(CITIZEN_MONTHLY_EXPENSES_URL, async (req, res) => {
  const form = new GenericForm(toForm(req));
  try {
    await form.validate();
    if (form.hasErrors()) {
      renderForm(form, res);
    } else {
      await saveRegularExpenses(req.params.id, form.model);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_MONTHLY_INCOME_URL));
    }
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});
export default regularExpensesController;
