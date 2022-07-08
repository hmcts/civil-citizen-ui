import * as express from 'express';
import {CITIZEN_DEPENDANTS_URL, CITIZEN_PARTNER_SEVERE_DISABILITY_URL} from '../../../../urls';
import {PartnerSevereDisability} from '../../../../../common/form/models/statementOfMeans/partner/partnerSevereDisability';
import {ValidationError, Validator} from 'class-validator';
import {PartnerSevereDisabilityService} from '../../../../../services/features/response/statementOfMeans/partner/partnerSevereDisabilityService';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';

const partnerViewPath = 'features/response/statementOfMeans/partner/partner-severe-disability';
const partnerSevereDisabilityController = express.Router();
const partnerSevereDisabilityService = new PartnerSevereDisabilityService();
const validator = new Validator();

function renderView(form: PartnerSevereDisability, res: express.Response): void {
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
    const partnerSevereDisability: PartnerSevereDisability = new PartnerSevereDisability(req.body.option);
    const errors: ValidationError[] = validator.validateSync(partnerSevereDisability);
    if (errors?.length > 0) {
      partnerSevereDisability.errors = errors;
      renderView(partnerSevereDisability, res);
    } else {
      try {
        await partnerSevereDisabilityService.savePartnerSevereDisability(req.params.id, partnerSevereDisability);
        res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_DEPENDANTS_URL));
      } catch (error) {
        next(error);
      }
    }
  });

export default partnerSevereDisabilityController;
