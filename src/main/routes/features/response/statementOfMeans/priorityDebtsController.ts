import {NextFunction, RequestHandler, Response, Router} from 'express';
import {GenericForm} from 'form/models/genericForm';
import {PriorityDebts} from 'form/models/statementOfMeans/priorityDebts';
import {CITIZEN_DEBTS_URL, CITIZEN_PRIORITY_DEBTS_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  getPriorityDebts,
  getPriorityDebtsForm,
  savePriorityDebts,
} from 'services/features/response/statementOfMeans/priorityDebtsService';
import {AppRequest} from 'common/models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';

const priorityDebtsController = Router();
const priorityDebtsView = 'features/response/statementOfMeans/priority-debts';

function renderForm(form: GenericForm<PriorityDebts>, res: Response) {
  res.render(priorityDebtsView, {form});
}

priorityDebtsController.get(CITIZEN_PRIORITY_DEBTS_URL, (async (req, res, next: NextFunction) => {
  try {
    const priorityDebts = await getPriorityDebts(<AppRequest>req);
    renderForm(new GenericForm<PriorityDebts>(priorityDebts), res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

priorityDebtsController.post(CITIZEN_PRIORITY_DEBTS_URL, (async (req, res, next: NextFunction) => {
  try {
    const form = new GenericForm(getPriorityDebtsForm(req));
    await form.validate();
    if (form.hasErrors()) {
      renderForm(form, res);
    } else {
      await savePriorityDebts(<AppRequest>req, form.model);
      const caseId = getRouteParam(req, 'id');
      res.redirect(constructResponseUrlWithIdParams(caseId, CITIZEN_DEBTS_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default priorityDebtsController;
