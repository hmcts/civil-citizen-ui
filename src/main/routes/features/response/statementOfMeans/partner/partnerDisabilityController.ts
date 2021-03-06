import * as express from 'express';
import {
  CITIZEN_DEPENDANTS_URL,
  CITIZEN_PARTNER_DISABILITY_URL,
  CITIZEN_PARTNER_SEVERE_DISABILITY_URL,
} from '../../../../urls';
import {PartnerDisability} from '../../../../../common/form/models/statementOfMeans/partner/partnerDisability';
import {ValidationError,Validator} from 'class-validator';
import {PartnerDisabilityService} from '../../../../../services/features/response/statementOfMeans/partner/partnerDisabilityService';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';

const partnerViewPath = 'features/response/statementOfMeans/partner/partner-disability';
const partnerDisabilityController = express.Router();
const partnerDisabilityService = new PartnerDisabilityService();
const validator = new Validator();

function renderView(form: PartnerDisability, res: express.Response): void {
  res.render(partnerViewPath, {form});
}

partnerDisabilityController.get(CITIZEN_PARTNER_DISABILITY_URL, async (req, res, next: express.NextFunction) => {
  try {
    const partnerDisability = await partnerDisabilityService.getPartnerDisability(req.params.id);
    renderView(partnerDisability, res);
  } catch (error) {
    next(error);
  }
});

partnerDisabilityController.post(CITIZEN_PARTNER_DISABILITY_URL,
  async (req, res, next: express.NextFunction) => {
    const partnerDisability: PartnerDisability = new PartnerDisability(req.body.option);

    const errors: ValidationError[] = validator.validateSync(partnerDisability);
    if (errors?.length > 0) {
      partnerDisability.errors = errors;
      renderView(partnerDisability, res);
    } else {
      try {
        await partnerDisabilityService.savePartnerDisability(req.params.id, partnerDisability);
        if (partnerDisability.option == 'yes') {
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_PARTNER_SEVERE_DISABILITY_URL));
        } else {
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_DEPENDANTS_URL));
        }
      } catch (error) {
        next(error);
      }
    }
  });

export default partnerDisabilityController;
