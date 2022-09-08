import * as express from 'express';
import {CITIZEN_DEPENDANTS_URL, CITIZEN_PARTNER_SEVERE_DISABILITY_URL} from '../../../../urls';
import {PartnerSevereDisability} from '../../../../../common/form/models/statementOfMeans/partner/partnerSevereDisability';
import {PartnerSevereDisabilityService} from '../../../../../services/features/response/statementOfMeans/partner/partnerSevereDisabilityService';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {GenericForm} from '../../../../../common/form/models/genericForm';

const partnerViewPath = 'features/response/statementOfMeans/partner/partner-severe-disability';
const partnerSevereDisabilityController = express.Router();
const partnerSevereDisabilityService = new PartnerSevereDisabilityService();

function renderView(partnerSevereDisability: GenericForm<PartnerSevereDisability>, res: express.Response): void {
  const form = Object.assign(partnerSevereDisability);
  form.option = partnerSevereDisability.model.option;
  res.render(partnerViewPath, { form });
}

partnerSevereDisabilityController.get(CITIZEN_PARTNER_SEVERE_DISABILITY_URL, async (req, res, next: express.NextFunction) => {
  try {
    const partnerSevereDisability = await partnerSevereDisabilityService.getPartnerSevereDisability(req.params.id);
    renderView(partnerSevereDisability, res);
  } catch (error) {
    next(error);
  }
});

partnerSevereDisabilityController.post(CITIZEN_PARTNER_SEVERE_DISABILITY_URL,
  async (req, res, next: express.NextFunction) => {
    try {
      const form: GenericForm<PartnerSevereDisability> = new GenericForm(new PartnerSevereDisability(req.body.option));
      form.validateSync();
      if (form.hasErrors()) {
        renderView(form, res);
      } else {
        await partnerSevereDisabilityService.savePartnerSevereDisability(req.params.id, form);
        res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_DEPENDANTS_URL));
      }
    } catch (error) {
      next(error);
    }
  });

export default partnerSevereDisabilityController;
