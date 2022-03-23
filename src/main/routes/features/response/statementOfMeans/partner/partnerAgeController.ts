import * as express from 'express';
import {
  CITIZEN_DEPENDANTS_URL,
  CITIZEN_PARTNER_AGE_URL,
  CITIZEN_PARTNER_DISABILITY_URL,
  CITIZEN_PARTNER_PENSION_URL,
} from '../../../../urls';
import {PartnerAge} from '../../../../../common/form/models/statementOfMeans/partner/partnerAge';
import {ValidationError, Validator} from 'class-validator';
import {PartnerAgeService} from '../../../../../modules/statementOfMeans/partner/partnerAgeService';
import {DisabilityService} from '../../../../../modules/statementOfMeans/disabilityService';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';

const citizenPartnerAgeViewPath = 'features/response/statementOfMeans/partner/partner-age';
const router = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partnerAgeService');
const partnerAgeService = new PartnerAgeService();
const disabilityService = new DisabilityService();
const validator = new Validator();

function renderView(form: PartnerAge, res: express.Response): void {
  res.render(citizenPartnerAgeViewPath, {form});
}

router.get(CITIZEN_PARTNER_AGE_URL, async (req, res) => {
  try {
    const response = await partnerAgeService.getPartnerAge(req.params.id);
    const partner = response ? new PartnerAge(response.option) : new PartnerAge();
    renderView(partner, res);
  } catch (error) {
    logger.error(`${error.stack || error}`);
    res.status(500).send({ error: error.message });
  }
});

router.post(CITIZEN_PARTNER_AGE_URL,
  async (req, res) => {
    const partnerAge: PartnerAge = new PartnerAge(req.body.partnerAge);
    const errors: ValidationError[] = validator.validateSync(partnerAge);
    if (errors && errors.length > 0) {
      partnerAge.errors = errors;
      renderView(partnerAge, res);
    } else {
      try {
        await partnerAgeService.savePartnerAge(req.params.id, partnerAge);
        if (partnerAge.option == 'yes') {
          res.redirect(CITIZEN_PARTNER_PENSION_URL);
        } else {
          const disability = await disabilityService.getDisability(req.params.id);
          if (disability.option == 'yes') {
            res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_PARTNER_DISABILITY_URL));
          } else {
            res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_DEPENDANTS_URL));
          }
        }
      } catch (err: unknown) {
        logger.error(`${err as Error || err}`);
      }
    }
  });

export default router;
