import * as express from 'express';
import {CITIZEN_DISABILITY_URL, CITIZEN_RESIDENCE_URL, CITIZEN_SEVERELY_DISABLED_URL} from '../../../urls';
import {Disability} from '../../../../common/form/models/statementOfMeans/disability';
import {ValidationError, Validator} from 'class-validator';
import {DisabilityService} from '../../../../services/features/response/statementOfMeans/disabilityService';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';

const citizenDisabilityViewPath = 'features/response/statementOfMeans/disability';
const disabilityController = express.Router();
const disabilityService = new DisabilityService();
const validator = new Validator();

function renderView(form: Disability, res: express.Response): void {
  res.render(citizenDisabilityViewPath, { form });
}

disabilityController.get(CITIZEN_DISABILITY_URL, async (req, res, next: express.NextFunction) => {
  try {
    const disability = await disabilityService.getDisability(req.params.id);
    renderView(disability, res);
  } catch (error) {
    next(error);
  }
});

disabilityController.post(CITIZEN_DISABILITY_URL,
  async (req, res, next: express.NextFunction) => {
    const disability: Disability = new Disability(req.body.option);
    const errors: ValidationError[] = validator.validateSync(disability);
    if (errors?.length > 0) {
      disability.errors = errors;
      renderView(disability, res);
    } else {
      try {
        await disabilityService.saveDisability(req.params.id, disability);
        if (disability.option == 'yes') {
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
