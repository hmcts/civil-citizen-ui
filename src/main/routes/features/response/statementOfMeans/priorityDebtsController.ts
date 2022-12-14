import {NextFunction, Response, Router} from 'express';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {PriorityDebts} from '../../../../common/form/models/statementOfMeans/priorityDebts';
import {CITIZEN_DEBTS_URL, CITIZEN_PRIORITY_DEBTS_URL} from '../../../urls';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {
  getPriorityDebts,
  getPriorityDebtsForm,
  savePriorityDebts,
} from '../../../../services/features/response/statementOfMeans/priorityDebtsService';

const priorityDebtsController = Router();
const priorityDebtsView = 'features/response/statementOfMeans/priority-debts';

function renderForm(form: GenericForm<PriorityDebts>, res: Response) {
  res.render(priorityDebtsView, {form});
}

priorityDebtsController.get(CITIZEN_PRIORITY_DEBTS_URL, async (req, res, next: NextFunction) => {
  try {
    const priorityDebts = await getPriorityDebts(req.params.id);
    renderForm(new GenericForm<PriorityDebts>(priorityDebts), res);
  } catch (error) {
    next(error);
  }
});

priorityDebtsController.post(CITIZEN_PRIORITY_DEBTS_URL, async (req, res, next: NextFunction) => {
  try {
    const form = new GenericForm(getPriorityDebtsForm(req));
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

export default priorityDebtsController;
