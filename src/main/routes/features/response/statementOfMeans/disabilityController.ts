import * as express from 'express';
import {CITIZEN_DISABILITY_URL, CITIZEN_RESIDENCE_URL, CITIZEN_SEVERELY_DISABLED_URL} from '../../../urls';
import {Disability} from '../../../../common/form/models/statementOfMeans/disability';
import {DisabilityService} from '../../../../services/features/response/statementOfMeans/disabilityService';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {GenericForm} from '../../../../common/form/models/genericForm';

const citizenDisabilityViewPath = 'features/response/statementOfMeans/disability';
const disabilityController = express.Router();
const disabilityService = new DisabilityService();

function renderView(disabilityForm: GenericForm<Disability>, res: express.Response): void {
  const form = Object.assign(disabilityForm);
  form.option = form.model.option;
  res.render(citizenDisabilityViewPath, { form });
}

disabilityController.get(CITIZEN_DISABILITY_URL, async (req, res, next: express.NextFunction) => {
  try {
    renderView(await disabilityService.getDisability(req.params.id), res);
  } catch (error) {
    next(error);
  }
});

disabilityController.post(CITIZEN_DISABILITY_URL,
  async (req, res, next: express.NextFunction) => {
    const form = new GenericForm(new Disability(req.body.option));
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      try {
        await disabilityService.saveDisability(req.params.id, form);
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
