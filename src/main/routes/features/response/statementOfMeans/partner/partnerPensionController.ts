import * as express from 'express';
import {CITIZEN_DEPENDANTS_URL, CITIZEN_PARTNER_DISABILITY_URL, CITIZEN_PARTNER_PENSION_URL} from '../../../../urls';
import {PartnerPension} from '../../../../../common/form/models/statementOfMeans/partner/partnerPension';
import {ValidationError, Validator} from 'class-validator';
import {PartnerPensionService} from '../../../../../modules/statementOfMeans/partner/partnerPensionService';
import {DisabilityService} from '../../../../../modules/statementOfMeans/disabilityService';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';

const citizenPartnerPensionViewPath = 'features/response/statementOfMeans/partner/partner-pension';
const router = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partnerPensionService');
const partnerPensionService = new PartnerPensionService();
const disabilityService = new DisabilityService();
const validator = new Validator();

function renderView(form: PartnerPension, res: express.Response): void {
  res.render(citizenPartnerPensionViewPath, {form});
}

router.get(CITIZEN_PARTNER_PENSION_URL, async (req, res) => {
  try {
    const partnerPension = await partnerPensionService.getPartnerPension(req.params.id);
    renderView(partnerPension, res);
  } catch (err: unknown) {
    logger.error(`${err as Error || err}`);
  }
});

router.post(CITIZEN_PARTNER_PENSION_URL,
  async (req, res) => {
    const partnerPension: PartnerPension = new PartnerPension(req.body.partnerPension);
    const errors: ValidationError[] = validator.validateSync(partnerPension);
    if (errors && errors.length > 0) {
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
      } catch (err: unknown) {
        logger.error(`${err as Error || err}`);
      }
    }
  });

export default router;
