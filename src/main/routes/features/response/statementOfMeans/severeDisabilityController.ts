import * as express from 'express';
import {CITIZEN_RESIDENCE_URL, CITIZEN_SEVERELY_DISABLED_URL} from '../../../urls';
import {SevereDisability} from '../../../../common/form/models/statementOfMeans/severeDisability';
import {ValidationError, Validator} from 'class-validator';
import {SevereDisabilityService} from '../../../../services/features/response/statementOfMeans/severeDisabilityService';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';

const citizenSevereDisabilityViewPath = 'features/response/statementOfMeans/are-you-severely-disabled';
const severeDisabilityController = express.Router();
const severeDisabilityService = new SevereDisabilityService();
const validator = new Validator();

function renderView(form: SevereDisability, res: express.Response): void {
  res.render(citizenSevereDisabilityViewPath, { form });
}

severeDisabilityController.get(CITIZEN_SEVERELY_DISABLED_URL, async (req, res, next: express.NextFunction) => {
  try {
    const severeDisability = await severeDisabilityService.getSevereDisability(req.params.id);
    renderView(severeDisability, res);
  } catch (error) {
    next(error);
  }
});

severeDisabilityController.post(CITIZEN_SEVERELY_DISABLED_URL,
  async (req, res, next: express.NextFunction) => {
    const severeDisability: SevereDisability = new SevereDisability(req.body.option);
    const errors: ValidationError[] = validator.validateSync(severeDisability);
    if (errors?.length > 0) {
      severeDisability.errors = errors;
      renderView(severeDisability, res);
    } else {
      try {
        await severeDisabilityService.saveSevereDisability(req.params.id, severeDisability);
        res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_RESIDENCE_URL));
      } catch (error) {
        next(error);
      }
    }
  });

export default severeDisabilityController;
