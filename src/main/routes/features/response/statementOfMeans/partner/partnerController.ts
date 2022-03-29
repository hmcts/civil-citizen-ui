import * as express from 'express';
import {CITIZEN_DEPENDANTS_URL, CITIZEN_PARTNER_AGE_URL, CITIZEN_PARTNER_URL} from '../../../../urls';
import {Cohabiting} from '../../../../../common/form/models/statementOfMeans/partner/cohabiting';
import {ValidationError, Validator} from 'class-validator';
import {CohabitingService} from '../../../../../modules/statementOfMeans/partner/cohabitingService';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';

const partnerViewPath = 'features/response/statementOfMeans/partner/partner';
const partnerController = express.Router();
const cohabitingService = new CohabitingService();
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partnerController');
const validator = new Validator();

function renderView(form: Cohabiting, res: express.Response): void {
  res.render(partnerViewPath, {form});
}

partnerController.get(CITIZEN_PARTNER_URL, async (req, res) => {
  try {
    const cohabiting = await cohabitingService.getCohabiting(req.params.id);
    renderView(cohabiting, res);
  } catch (err: unknown) {
    logger.error(`${err as Error || err}`);
  }
});

partnerController.post(CITIZEN_PARTNER_URL,
  async (req, res) => {
    const cohabiting: Cohabiting = new Cohabiting(req.body.option);
    const errors: ValidationError[] = validator.validateSync(cohabiting);
    if (errors && errors.length > 0) {
      cohabiting.errors = errors;
      renderView(cohabiting, res);
    } else {
      try {
        await cohabitingService.saveCohabiting(req.params.id, cohabiting);
        if (cohabiting.option == 'yes') {
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_PARTNER_AGE_URL));
        } else {
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_DEPENDANTS_URL));
        }
      } catch (err: unknown) {
        logger.error(`${err as Error || err}`);
      }
    }
  });

export default partnerController;
