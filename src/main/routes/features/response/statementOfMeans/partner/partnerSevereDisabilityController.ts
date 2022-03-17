import * as express from 'express';
import { CITIZEN_PARTNER_SEVERE_DISABILITY_URL, CITIZEN_PARTNER_DEPENDANTS_URL } from '../../../../urls';
import { Cohabiting } from '../../../../../common/form/models/statementOfMeans/partner/cohabiting';
import { ValidationError, Validator } from 'class-validator';
import { CohabitingService } from '../../../../../modules/statementOfMeans/partner/cohabitingService';
import { constructResponseUrlWithIdParams } from '../../../../../common/utils/urlFormatter';

const partnerViewPath = 'features/response/statementOfMeans/partner/partner';
const router = express.Router();
const partnerSevereDisability = new Cohabiting();
const cohabitingService = new CohabitingService();
const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partnerSevereDisabilityService');

function renderView(form: Cohabiting, res: express.Response): void {
  res.render(partnerViewPath, { form });
}

router.get(CITIZEN_PARTNER_SEVERE_DISABILITY_URL.toString(), async (req, res) => {
  try {
    const currentCohabing = await cohabitingService.getCohabiting(req.params.id);
    partnerSevereDisability.option = currentCohabing.option;
    renderView(partnerSevereDisability, res);
  } catch (err: unknown) {
    logger.error(`${err as Error || err}`);
  }
});

router.post(CITIZEN_PARTNER_SEVERE_DISABILITY_URL.toString(),
  async (req, res) => {
    const cohabiting: Cohabiting = new Cohabiting(req.body.cohabiting);
    const validator = new Validator();
    const errors: ValidationError[] = validator.validateSync(cohabiting);
    if (errors && errors.length > 0) {
      cohabiting.errors = errors;
      renderView(cohabiting, res);
    } else {
      try {
        await cohabitingService.saveCohabiting(req.params.id, cohabiting);
        if (cohabiting.option == 'yes') {
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_PARTNER_DEPENDANTS_URL));
        } else {
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_PARTNER_DEPENDANTS_URL));
        }
      } catch (err: unknown) {
        logger.error(`${err as Error || err}`);
      }
    }
  });

export default router;
