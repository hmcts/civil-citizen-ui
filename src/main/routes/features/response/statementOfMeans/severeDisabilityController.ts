import {NextFunction, RequestHandler, Response, Router} from 'express';
import {CITIZEN_RESIDENCE_URL, CITIZEN_SEVERELY_DISABLED_URL} from '../../../urls';
import {SevereDisabilityService} from '../../../../services/features/response/statementOfMeans/severeDisabilityService';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {GenericYesNo} from '../../../../common/form/models/genericYesNo';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';

const citizenSevereDisabilityViewPath = 'features/response/statementOfMeans/are-you-severely-disabled';
const severeDisabilityController = Router();
const severeDisabilityService = new SevereDisabilityService();

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(citizenSevereDisabilityViewPath, {form});
}

severeDisabilityController.get(CITIZEN_SEVERELY_DISABLED_URL, (async (req, res, next: NextFunction) => {
  try {
    const severeDisability = await severeDisabilityService.getSevereDisability(generateRedisKey(<AppRequest>req));
    renderView(severeDisability, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

severeDisabilityController.post(CITIZEN_SEVERELY_DISABLED_URL, (async (req, res, next: NextFunction) => {
  try {
    const form: GenericForm<GenericYesNo> = new GenericForm(new GenericYesNo(req.body.option));
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await severeDisabilityService.saveSevereDisability(generateRedisKey(<AppRequest>req), form);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_RESIDENCE_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default severeDisabilityController;
