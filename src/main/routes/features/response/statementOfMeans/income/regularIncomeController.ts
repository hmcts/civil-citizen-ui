import {NextFunction, RequestHandler, Response, Router} from 'express';
import {GenericForm} from 'form/models/genericForm';
import {RegularIncome} from 'form/models/statementOfMeans/expensesAndIncome/regularIncome';
import {CITIZEN_EXPLANATION_URL, CITIZEN_MONTHLY_INCOME_URL} from 'routes/urls';
import {
  getRegularIncome,
  saveRegularIncome,
} from 'services/features/response/statementOfMeans/income/regularIncomeService';
import {toRegularIncomeForm} from 'common/utils/expenseAndIncome/regularIncomeExpenseCoverter';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'common/models/AppRequest';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';

const regularIncomeController = Router();

function renderView(form: GenericForm<RegularIncome>, res: Response) {
  res.render('features/response/statementOfMeans/income/regular-income', {form});
}

regularIncomeController.get(CITIZEN_MONTHLY_INCOME_URL, (async (req, res, next: NextFunction) => {
  try {
    const model = await getRegularIncome(generateRedisKey(<AppRequest>req));
    renderView(new GenericForm<RegularIncome>(model), res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

regularIncomeController.post(CITIZEN_MONTHLY_INCOME_URL, (async (req, res, next: NextFunction) => {
  try {
    const form = new GenericForm(toRegularIncomeForm(req));
    await form.validate();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveRegularIncome(generateRedisKey(<AppRequest>req), form.model);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_EXPLANATION_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default regularIncomeController;
