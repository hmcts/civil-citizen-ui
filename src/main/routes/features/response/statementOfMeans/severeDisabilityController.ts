import * as express from 'express';
import {CITIZEN_RESIDENCE_URL, CITIZEN_SEVERELY_DISABLED_URL} from '../../../urls';
import {SevereDisability} from '../../../../common/form/models/statementOfMeans/severeDisability';
import {SevereDisabilityService} from '../../../../services/features/response/statementOfMeans/severeDisabilityService';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {GenericForm} from '../../../../common/form/models/genericForm';

const citizenSevereDisabilityViewPath = 'features/response/statementOfMeans/are-you-severely-disabled';
const severeDisabilityController = express.Router();
const severeDisabilityService = new SevereDisabilityService();

function renderView(severeDisability: GenericForm<SevereDisability>, res: express.Response): void {
  const form = Object.assign(severeDisability);
  form.option = severeDisability.model.option;
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

severeDisabilityController.post(CITIZEN_SEVERELY_DISABLED_URL, async (req, res, next: express.NextFunction) => {
  try {
    const form: GenericForm<SevereDisability> = new GenericForm(new SevereDisability(req.body.option));
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await severeDisabilityService.saveSevereDisability(req.params.id, form);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_RESIDENCE_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default severeDisabilityController;
