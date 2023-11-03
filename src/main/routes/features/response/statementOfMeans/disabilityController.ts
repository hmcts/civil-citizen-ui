import {NextFunction, Response, Router} from 'express';
import {CITIZEN_DISABILITY_URL, CITIZEN_RESIDENCE_URL, CITIZEN_SEVERELY_DISABLED_URL} from '../../../urls';
import {DisabilityService} from '../../../../services/features/response/statementOfMeans/disabilityService';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {GenericYesNo} from '../../../../common/form/models/genericYesNo';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';

const citizenDisabilityViewPath = 'features/response/statementOfMeans/disability';
const disabilityController = Router();
const disabilityService = new DisabilityService();

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(citizenDisabilityViewPath, {form});
}

disabilityController.get(CITIZEN_DISABILITY_URL, async (req, res, next: NextFunction) => {
  try {
    renderView(await disabilityService.getDisability(generateRedisKey(<AppRequest>req)), res);
  } catch (error) {
    next(error);
  }
});

disabilityController.post(CITIZEN_DISABILITY_URL,
  async (req, res, next: NextFunction) => {
    const form = new GenericForm(new GenericYesNo(req.body.option));
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      try {
        await disabilityService.saveDisability(generateRedisKey(<AppRequest>req), form);
        if (form.model.option == 'yes') {
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_SEVERELY_DISABLED_URL));
        } else {
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_RESIDENCE_URL));
        }
      } catch (error) {
        next(error);
      }
    }
  });

export default disabilityController;
