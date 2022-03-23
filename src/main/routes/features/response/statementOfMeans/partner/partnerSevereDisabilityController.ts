import * as express from 'express';
import {CITIZEN_DEPENDANTS_URL, CITIZEN_PARTNER_SEVERE_DISABILITY_URL} from '../../../../urls';
import {
  PartnerSevereDisability,
} from '../../../../../common/form/models/statementOfMeans/partner/partnerSevereDisability';
import {ValidationError, Validator} from 'class-validator';
import {
  PartnerSevereDisabilityService,
} from '../../../../../modules/statementOfMeans/partner/partnerSevereDisabilityService';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';

const partnerViewPath = 'features/response/statementOfMeans/partner/partner-severe-disability';
const router = express.Router();
const partnerSevereDisabilityService = new PartnerSevereDisabilityService();
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partnerSevereDisabilityService');
const validator = new Validator();

function renderView(form: PartnerSevereDisability, res: express.Response): void {
  res.render(partnerViewPath, {form});
}

router.get(CITIZEN_PARTNER_SEVERE_DISABILITY_URL, async (req, res) => {
  try {
    const partnerSevereDisability = await partnerSevereDisabilityService.getPartnerSevereDisability(req.params.id);
    renderView(partnerSevereDisability, res);
  } catch (err: unknown) {
    logger.error(`${err as Error || err}`);
  }
});

router.post(CITIZEN_PARTNER_SEVERE_DISABILITY_URL,
  async (req, res) => {
    const partnerSevereDisability: PartnerSevereDisability = new PartnerSevereDisability(req.body.option);
    const errors: ValidationError[] = validator.validateSync(partnerSevereDisability);
    if (errors && errors.length > 0) {
      partnerSevereDisability.errors = errors;
      renderView(partnerSevereDisability, res);
    } else {
      try {
        await partnerSevereDisabilityService.savePartnerSevereDisability(req.params.id, partnerSevereDisability);
        res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_DEPENDANTS_URL));
      } catch (err: unknown) {
        logger.error(`${err as Error || err}`);
      }
    }
  });

export default router;
