import express from 'express';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import RegularIncome from '../../../../../common/form/models/statementOfMeans/expensesAndIncome/regularIncome';
import {CITIZEN_EXPLANATION_URL, CITIZEN_MONTHLY_INCOME_URL} from '../../../../urls';
import {getRegularIncome, saveRegularIncome} from '../../../../../services/features/response/statementOfMeans/income/regularIncomeService';
import {toRegularIncomeForm} from '../../../../../common/utils/expenseAndIncome/regularIncomeExpenseCoverter';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';

const regularIncomeController = express.Router();

function renderView(form: GenericForm<RegularIncome>, res: express.Response) {
  res.render('features/response/statementOfMeans/income/regular-income', {form: form});
}

regularIncomeController.get(CITIZEN_MONTHLY_INCOME_URL, async (req, res,next: express.NextFunction) => {
  try {
    const model = await getRegularIncome(req.params.id);
    renderView(new GenericForm<RegularIncome>(model), res);
  } catch (error) {
    next(error);
  }
});

regularIncomeController.post(CITIZEN_MONTHLY_INCOME_URL, async (req, res, next: express.NextFunction) => {
  try {
    const form = new GenericForm(toRegularIncomeForm(req));
    await form.validate();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveRegularIncome(req.params.id, form.model);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_EXPLANATION_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default regularIncomeController;
