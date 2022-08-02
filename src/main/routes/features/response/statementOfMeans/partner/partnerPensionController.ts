import * as express from 'express';
import {CITIZEN_DEPENDANTS_URL, CITIZEN_PARTNER_DISABILITY_URL, CITIZEN_PARTNER_PENSION_URL} from '../../../../urls';
import {PartnerPension} from '../../../../../common/form/models/statementOfMeans/partner/partnerPension';
import {ValidationError, Validator} from 'class-validator';
import {PartnerPensionService} from '../../../../../services/features/response/statementOfMeans/partner/partnerPensionService';
import {DisabilityService} from '../../../../../services/features/response/statementOfMeans/disabilityService';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';

const citizenPartnerPensionViewPath = 'features/response/statementOfMeans/partner/partner-pension';
const partnerPensionController = express.Router();
const partnerPensionService = new PartnerPensionService();
const disabilityService = new DisabilityService();
const validator = new Validator();

function renderView(form: PartnerPension, res: express.Response): void {
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
    const partnerPension: PartnerPension = new PartnerPension(req.body.option);
    const errors: ValidationError[] = validator.validateSync(partnerPension);
    if (errors?.length > 0) {
      partnerPension.errors = errors;
      renderView(partnerPension, res);
    } else {
      try {
        await partnerPensionService.savePartnerPension(req.params.id, partnerPension);
        const disability = await disabilityService.getDisability(req.params.id);
        if (disability.option == 'no') {
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_DEPENDANTS_URL));
        } else {
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_PARTNER_DISABILITY_URL));
        }
      } catch (error) {
        next(error);
      }
    }
  });

export default partnerPensionController;
