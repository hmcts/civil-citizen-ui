import express from 'express';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {RegularExpenses} from '../../../../../common/form/models/statementOfMeans/expenses/regularExpenses';
import {CITIZEN_MONTHLY_EXPENSES_URL} from '../../../../urls';

const regularExpensesController = express.Router();
const regularExpensesView = 'features/response/statementOfMeans/expenses/regular-expenses';

function renderForm(form: GenericForm<RegularExpenses>, res: express.Response) {
  res.render(regularExpensesView, {form: form});
}

regularExpensesController.get(CITIZEN_MONTHLY_EXPENSES_URL, (req, res) => {
  renderForm(new GenericForm<RegularExpenses>(RegularExpenses.buildEmptyForm()), res);
});

export default regularExpensesController;
