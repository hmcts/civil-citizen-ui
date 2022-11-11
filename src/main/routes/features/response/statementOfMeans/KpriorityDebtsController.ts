import {NextFunction, Response, Router} from 'express';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {RegularExpenses} from '../../../../common/form/models/statementOfMeans/expensesAndIncome/regularExpenses';
import {CITIZEN_DEBTS_URL, CITIZEN_PRIORITY_DEBTS_URL} from '../../../urls';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {
  KgetRegularExpenses,
  KsaveRegularExpenses,
} from '../../../../services/features/response/statementOfMeans/expenses/regularExpensesService';
import {KtoRegularExpenseForm} from '../../../../common/utils/expenseAndIncome/regularIncomeExpenseCoverter';

const KpriorityDebtsController = Router();
const priorityDebtsView = 'features/response/statementOfMeans/Kpriority-debts';

function renderForm(form: GenericForm<RegularExpenses>, res: Response) {
  res.render(priorityDebtsView, {form});
}

KpriorityDebtsController.get(CITIZEN_PRIORITY_DEBTS_URL, async (req, res, next: NextFunction) => {
  try {
    const model = await KgetRegularExpenses(req.params.id);
    renderForm(new GenericForm<RegularExpenses>(model), res);
  } catch (error) {
    next(error);
  }
});

KpriorityDebtsController.post(CITIZEN_PRIORITY_DEBTS_URL, async (req, res, next: NextFunction) => {
  // console.log('req.body--', req.body.model);
  // console.log('det', req.body.model.mortgage);
  // console.log('reet', req.body.model.rent);
  // console.log('wreet', req.body.model.water);
  // console.log('gas', req.body.model.gas);
  const form = new GenericForm(KtoRegularExpenseForm(req));
  try {
    await form.validate();
    if (form.hasErrors()) {
      renderForm(form, res);
    } else {
      await KsaveRegularExpenses(req.params.id, form.model);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_DEBTS_URL));
    }
  } catch (error) {
    next(error);
  }
});

// TODO: check error messages
// find a better way to call conditionalls
// update check your answers
// update tests
// arrange the file structure
// change file names remove K
// create own service for get, getForm, save

export default KpriorityDebtsController;
