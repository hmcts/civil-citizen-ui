import * as express from 'express';
import {
  CITIZEN_DEPENDANTS_URL,
  CITIZEN_PARTNER_DISABILITY_URL,
  CITIZEN_PARTNER_SEVERE_DISABILITY_URL,
} from '../../../../urls';
import { PartnerDisability } from '../../../../../common/form/models/statementOfMeans/partner/partnerDisability';
import { ValidationError, Validator } from 'class-validator';
import { PartnerDisabilityService } from '../../../../../modules/statementOfMeans/partner/partnerDisabilityService';
import { constructResponseUrlWithIdParams } from '../../../../../common/utils/urlFormatter';

const partnerViewPath = 'features/response/statementOfMeans/partner/partner-disability';
const router = express.Router();

const partnerDisabilityService = new PartnerDisabilityService();
const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partnerDisabilityService');
const validator = new Validator();

function renderView(form: PartnerDisability, res: express.Response): void {
  res.render(partnerViewPath, { form });
}

router.get(CITIZEN_PARTNER_DISABILITY_URL, async (req, res) => {
  try {
    const partnerDisability = await partnerDisabilityService.getPartnerDisability(req.params.id);
    renderView(partnerDisability, res);
  } catch (error) {
    logger.error(`${error as Error || error}`);
    res.status(500).send({ error: error.message });
  }
});

router.post(CITIZEN_PARTNER_DISABILITY_URL,
  async (req, res) => {
    const partnerDisability: PartnerDisability = new PartnerDisability(req.body.partnerDisability);

    const errors: ValidationError[] = validator.validateSync(partnerDisability);
    if (errors && errors.length > 0) {
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
        logger.error(`${error as Error || error}`);
        res.status(500).send({ error: error.message });
      }
    }
  });

export default router;
