import express from 'express';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import RegularIncome from '../../../../../common/form/models/statementOfMeans/expensesAndIncome/regularIncome';
import {CITIZEN_MONTHLY_INCOME_URL} from '../../../../urls';

const regularIncomeController = express.Router();

export default regularIncomeController;

function renderView(form: GenericForm<RegularIncome>, res: express.Response) {
  res.render('features/response/statementOfMeans/income/regular-income', {form: form});
}

regularIncomeController.get(CITIZEN_MONTHLY_INCOME_URL, (req, res) => {
  renderView(new GenericForm<RegularIncome>(RegularIncome.buildEmptyForm()), res);
});
