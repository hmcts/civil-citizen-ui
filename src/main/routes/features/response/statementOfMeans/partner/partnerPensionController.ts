import * as express from 'express';
import {CITIZEN_DEPENDANTS_URL, CITIZEN_PARTNER_DISABILITY_URL, CITIZEN_PARTNER_PENSION_URL} from '../../../../urls';
import {PartnerPension} from '../../../../../common/form/models/statementOfMeans/partner/partnerPension';
import {PartnerPensionService} from '../../../../../services/features/response/statementOfMeans/partner/partnerPensionService';
import {DisabilityService} from '../../../../../services/features/response/statementOfMeans/disabilityService';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {GenericForm} from '../../../../../common/form/models/genericForm';

const citizenPartnerPensionViewPath = 'features/response/statementOfMeans/partner/partner-pension';
const partnerPensionController = express.Router();
const partnerPensionService = new PartnerPensionService();
const disabilityService = new DisabilityService();

function renderView(partnerPension: GenericForm<PartnerPension>, res: express.Response): void {
  const form = Object.assign(partnerPension);
  form.option = partnerPension.model.option;
  res.render(citizenPartnerPensionViewPath, {form});
}

partnerPensionController.get(CITIZEN_PARTNER_PENSION_URL, async (req, res, next: express.NextFunction) => {
  try {
    const partnerPension = await partnerPensionService.getPartnerPension(req.params.id);
    renderView(partnerPension, res);
  } catch (error) {
    next(error);
  }
});

partnerPensionController.post(CITIZEN_PARTNER_PENSION_URL,
  async (req, res, next: express.NextFunction) => {
    const form: GenericForm<PartnerPension> = new GenericForm(new PartnerPension(req.body.option));
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      try {
        await partnerPensionService.savePartnerPension(req.params.id, form);
        const disability = await disabilityService.getDisability(req.params.id);
        (disability.option == 'no')
          ? res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_DEPENDANTS_URL))
          : res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_PARTNER_DISABILITY_URL));
      } catch (error) {
        next(error);
      }
    }
  });

export default partnerPensionController;
