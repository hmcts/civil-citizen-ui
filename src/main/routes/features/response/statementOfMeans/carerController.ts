import {NextFunction, RequestHandler, Response, Router} from 'express';
import {CITIZEN_CARER_URL, CITIZEN_EMPLOYMENT_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getCarer, saveCarer} from 'services/features/response/statementOfMeans/carerService';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {AppRequest} from 'common/models/AppRequest';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';

const carerViewPath = 'features/response/statementOfMeans/carer';
const carerController = Router();

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(carerViewPath, {form});
}

carerController.get(CITIZEN_CARER_URL, (async (req, res, next: NextFunction) => {
  try {
    renderView(new GenericForm(await getCarer(generateRedisKey(<AppRequest>req))), res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

carerController.post(CITIZEN_CARER_URL,
  (async (req, res, next: NextFunction) => {
    const carerForm: GenericForm<GenericYesNo> = new GenericForm(new GenericYesNo(req.body.option));
    carerForm.validateSync();
    if (carerForm.hasErrors()) {
      renderView(carerForm, res);
    } else {
      try {
        await saveCarer(generateRedisKey(<AppRequest>req), carerForm.model);
        res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_EMPLOYMENT_URL));
      } catch (error) {
        next(error);
      }
    }
  }) as RequestHandler);

export default carerController;
