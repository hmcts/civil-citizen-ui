import {NextFunction, Response, Router} from 'express';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {RegularExpenses} from '../../../../common/form/models/statementOfMeans/expensesAndIncome/regularExpenses';
import {CITIZEN_DEBTS_URL, CITIZEN_PRIORITY_DEBTS_URL} from '../../../urls';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {
  getPriorityDebts,
  getPriorityDebtsForm,
  savePriorityDebts,
} from '../../../../services/features/response/statementOfMeans/priorityDebtsService';

const priorityDebtsController = Router();
const priorityDebtsView = 'features/response/statementOfMeans/priority-debts';

function renderForm(form: GenericForm<RegularExpenses>, res: Response) {
  res.render(priorityDebtsView, {form});
}

priorityDebtsController.get(CITIZEN_PRIORITY_DEBTS_URL, async (req, res, next: NextFunction) => {
  try {
    debugger;
    const model = await getPriorityDebts(req.params.id);
    renderForm(new GenericForm<RegularExpenses>(model), res);
  } catch (error) {
    next(error);
  }
});

priorityDebtsController.post(CITIZEN_PRIORITY_DEBTS_URL, async (req, res, next: NextFunction) => {
  debugger;
  const form = new GenericForm(getPriorityDebtsForm(req));
  try {
    await form.validate();
    if (form.hasErrors()) {
      renderForm(form, res);
    } else {
      await savePriorityDebts(req.params.id, form.model);
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

export default priorityDebtsController;
