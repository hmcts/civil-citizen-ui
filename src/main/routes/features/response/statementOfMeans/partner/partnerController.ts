import * as express from 'express';
import { CITIZEN_DEPENDANTS_URL, CITIZEN_PARTNER_AGE_URL, CITIZEN_PARTNER_URL } from '../../../../urls';
import { Cohabiting } from '../../../../../common/form/models/statementOfMeans/partner/cohabiting';
import { CohabitingService } from '../../../../../services/features/response/statementOfMeans/partner/cohabitingService';
import { constructResponseUrlWithIdParams } from '../../../../../common/utils/urlFormatter';
import {GenericForm} from '../../../../../common/form/models/genericForm';

const partnerViewPath = 'features/response/statementOfMeans/partner/partner';
const partnerController = express.Router();
const cohabitingService = new CohabitingService();

function renderView(cohabiting: GenericForm<Cohabiting>, res: express.Response): void {
  const form = Object.assign(cohabiting);
  form.option = cohabiting.model.option;
  res.render(partnerViewPath, { form });
}

partnerController.get(CITIZEN_PARTNER_URL, async (req, res, next: express.NextFunction) => {
  try {
    const cohabiting = await cohabitingService.getCohabiting(req.params.id);
    renderView(cohabiting, res);
  } catch (error) {
    next(error);
  }
});

partnerController.post(CITIZEN_PARTNER_URL,
  async (req, res, next: express.NextFunction) => {
    try {
      const form: GenericForm<Cohabiting> = new GenericForm(new Cohabiting(req.body.option));
      form.validateSync();
      if (form.hasErrors()) {
        renderView(form, res);
      } else {
        await cohabitingService.saveCohabiting(req.params.id, form);
        form.model.option == 'yes'
          ? res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_PARTNER_AGE_URL))
          : res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_DEPENDANTS_URL));
      }
    } catch (error) {
      next(error);
    }
  });

export default partnerController;
