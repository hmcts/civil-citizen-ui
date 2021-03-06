import * as express from 'express';
import {
  CITIZEN_DEPENDANTS_URL,
  CITIZEN_PARTNER_AGE_URL,
  CITIZEN_PARTNER_DISABILITY_URL,
  CITIZEN_PARTNER_PENSION_URL,
} from '../../../../urls';
import { PartnerAge } from '../../../../../common/form/models/statementOfMeans/partner/partnerAge';
import { ValidationError, Validator } from 'class-validator';
import { PartnerAgeService } from '../../../../../services/features/response/statementOfMeans/partner/partnerAgeService';
import { DisabilityService } from '../../../../../services/features/response/statementOfMeans/disabilityService';
import { constructResponseUrlWithIdParams } from '../../../../../common/utils/urlFormatter';

const citizenPartnerAgeViewPath = 'features/response/statementOfMeans/partner/partner-age';
const partnerAgeController = express.Router();
const partnerAgeService = new PartnerAgeService();
const disabilityService = new DisabilityService();
const validator = new Validator();

function renderView(form: PartnerAge, res: express.Response): void {
  res.render(citizenPartnerAgeViewPath, { form });
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
    const partnerAge: PartnerAge = new PartnerAge(req.body.option);
    const errors: ValidationError[] = validator.validateSync(partnerAge);
    if (errors?.length > 0) {
      partnerAge.errors = errors;
      renderView(partnerAge, res);
    } else {
      try {
        await partnerAgeService.savePartnerAge(req.params.id, partnerAge);
        if (partnerAge.option == 'yes') {
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_PARTNER_PENSION_URL));
        } else {
          const disability = await disabilityService.getDisability(req.params.id);
          if (disability.option == 'yes') {
            res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_PARTNER_DISABILITY_URL));
          } else {
            res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_DEPENDANTS_URL));
          }
        }
      } catch (error) {
        next(error);
      }
    }
  });

export default partnerAgeController;
