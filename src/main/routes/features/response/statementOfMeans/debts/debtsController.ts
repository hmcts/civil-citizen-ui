import {NextFunction, RequestHandler, Response, Router} from 'express';
import {CITIZEN_DEBTS_URL, CITIZEN_MONTHLY_EXPENSES_URL} from 'routes/urls';
import {Debts} from 'form/models/statementOfMeans/debts/debts';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {getDebts, removeEmptyValueToDebts, saveDebts, transformToDebts} from 'services/features/response/statementOfMeans/debts/debtsService';

const debtsViewPath = 'features/response/statementOfMeans/debts/debts';
const debtsController = Router();

function renderView(form: GenericForm<Debts>, res: Response): void {
  res.render(debtsViewPath, {form});
}

debtsController.get(CITIZEN_DEBTS_URL, (async (req, res, next: NextFunction) => {
  try {
    renderView(new GenericForm(await getDebts(<AppRequest>req)), res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

debtsController.post(CITIZEN_DEBTS_URL,
  (async (req, res, next: NextFunction) => {
    try {
      const caseId = getRouteParam(req, 'id');
      const debtsForm: GenericForm<Debts> = new GenericForm(new Debts(req.body.option, transformToDebts(req)));
      debtsForm.validateSync();
      if (debtsForm.hasErrors()) {
        renderView(debtsForm, res);
      } else {
        await saveDebts(<AppRequest>req, new Debts(req.body.option, removeEmptyValueToDebts(req)));
        res.redirect(constructResponseUrlWithIdParams(caseId, CITIZEN_MONTHLY_EXPENSES_URL));
      }
    } catch (error) {
      next(error);
    }
  }) as RequestHandler);

export default debtsController;
