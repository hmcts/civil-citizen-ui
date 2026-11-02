import {NextFunction, RequestHandler, Response, Router} from 'express';
import {CITIZEN_CARER_URL, CITIZEN_EMPLOYMENT_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CarerService} from 'services/features/response/statementOfMeans/carerService';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {AppRequest} from 'common/models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';

const carerViewPath = 'features/response/statementOfMeans/carer';
const carerController = Router();
const carerService = new CarerService();

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(carerViewPath, {form});
}

carerController.get(CITIZEN_CARER_URL, (async (req, res, next: NextFunction) => {
  try {
    renderView(await carerService.getCarer(<AppRequest>req), res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

carerController.post(CITIZEN_CARER_URL,
  (async (req, res, next: NextFunction) => {
    const caseId = getRouteParam(req, 'id');
    const form: GenericForm<GenericYesNo> = new GenericForm(new GenericYesNo(req.body.option));
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      try {
        await carerService.saveCarer(<AppRequest>req, form);
        res.redirect(constructResponseUrlWithIdParams(caseId, CITIZEN_EMPLOYMENT_URL));
      } catch (error) {
        next(error);
      }
    }
  }) as RequestHandler);

export default carerController;
