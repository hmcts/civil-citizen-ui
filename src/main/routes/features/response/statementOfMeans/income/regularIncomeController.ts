import express from 'express';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import RegularIncome from '../../../../../common/form/models/statementOfMeans/expensesAndIncome/regularIncome';
import {CITIZEN_MONTHLY_INCOME_URL, EXPLANATION_URL} from '../../../../urls';
import {getRegularIncome, saveRegularIncome} from '../../../../../modules/statementOfMeans/income/regularIncomeService';
import {toRegularIncomeForm} from '../../../../../common/utils/expenseAndIncome/regularIncomeExpenseCoverter';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const regularIncomeController = express.Router();

export default regularIncomeController;

function renderView(form: GenericForm<RegularIncome>, res: express.Response) {
  res.render('features/response/statementOfMeans/income/regular-income', {form: form});
}

regularIncomeController.get(CITIZEN_MONTHLY_INCOME_URL, async (req, res) => {
  try {
    const form = await getRegularIncome(req.params.id);
    renderView(new GenericForm<RegularIncome>(form), res);
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

regularIncomeController.post(CITIZEN_MONTHLY_INCOME_URL, async (req, res) => {
  try {
    const form = new GenericForm(toRegularIncomeForm(req));
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveRegularIncome(req.params.id, form.model);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, EXPLANATION_URL));
    }
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});
