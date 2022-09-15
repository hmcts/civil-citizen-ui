import * as express from 'express';
import {
  CITIZEN_DEPENDANTS_URL,
  CITIZEN_PARTNER_AGE_URL,
  CITIZEN_PARTNER_DISABILITY_URL,
  CITIZEN_PARTNER_PENSION_URL,
} from '../../../../urls';
import {PartnerAgeService} from '../../../../../services/features/response/statementOfMeans/partner/partnerAgeService';
import {DisabilityService} from '../../../../../services/features/response/statementOfMeans/disabilityService';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {GenericYesNo} from '../../../../../common/form/models/genericYesNo';

const citizenPartnerAgeViewPath = 'features/response/statementOfMeans/partner/partner-age';
const partnerAgeController = express.Router();
const partnerAgeService = new PartnerAgeService();
const disabilityService = new DisabilityService();

function renderView(partnerAge: GenericForm<GenericYesNo>, res: express.Response): void {
  const form = Object.assign(partnerAge);
  form.option = partnerAge.model.option;
  res.render(citizenPartnerAgeViewPath, {form});
}

partnerAgeController.get(CITIZEN_PARTNER_AGE_URL, async (req, res, next: express.NextFunction) => {
  try {
    const partnerAge = await partnerAgeService.getPartnerAge(req.params.id);
    renderView(partnerAge, res);
  } catch (error) {
    next(error);
  }
});

partnerAgeController.post(CITIZEN_PARTNER_AGE_URL,
  async (req, res, next: express.NextFunction) => {
    try {
      const form: GenericForm<GenericYesNo> = new GenericForm(new GenericYesNo(req.body.option));
      form.validateSync();
      if (form.hasErrors()) {
        renderView(form, res);
      } else {
        await partnerAgeService.savePartnerAge(req.params.id, form);
        if (form.model.option == 'yes') {
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_PARTNER_PENSION_URL));
        } else {
          const disability = await disabilityService.getDisability(req.params.id);
          disability.model.option == 'yes'
            ? res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_PARTNER_DISABILITY_URL))
            : res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_DEPENDANTS_URL));
        }
      }
    } catch (error) {
      next(error);
    }
  });

export default partnerAgeController;
