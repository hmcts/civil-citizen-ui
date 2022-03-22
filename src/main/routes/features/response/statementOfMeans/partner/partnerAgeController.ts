import * as express from 'express';
import {
  CITIZEN_PARTNER_AGE_URL,
  CITIZEN_PARTNER_PENSION_URL,
  CITIZEN_PARTNER_DISABILITY_URL,
  CITIZEN_DEPENDANTS_URL,
} from '../../../../urls';
import {Partner} from '../../../../../common/form/models/statementOfMeans/partner';
import {ValidationError, Validator} from 'class-validator';
import {PartnerService} from '../../../../../modules/statementOfMeans/partner/partnerService';
import {DisabilityService} from '../../../../../modules/statementOfMeans/disabilityService';
import { constructResponseUrlWithIdParams } from '../../../../../common/utils/urlFormatter';

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('otherDependantsController');

const citizenPartnerAgeViewPath = 'features/response/statementOfMeans/partner/partner-age';
const router = express.Router();
//const partner = new Partner();
const partnerService = new PartnerService();
const disabilityService = new DisabilityService();

function renderView(form: Partner, res: express.Response): void {
  res.render(citizenPartnerAgeViewPath, {form});
}

router.get(CITIZEN_PARTNER_AGE_URL, async (req, res) => {
  try {
    await partnerService.getPartnerAge(req.params.id).then((data) => {
      const partner = data ? new Partner(data.option) : new Partner()
      renderView(partner, res);
    });
  } catch (error) {
    logger.error(`${error.stack || error}`);
    res.status(500).send({error: error.message});
  }
});

router.post(CITIZEN_PARTNER_AGE_URL,
  (req, res) => {
    const partner: Partner = new Partner(req.body.option);
    const validator = new Validator();
    const errors: ValidationError[] = validator.validateSync(partner);
    if (errors && errors.length > 0) {
      partner.errors = errors;
      renderView(partner, res);
    } else {
      partnerService.savePartnerAge(req.params.id, partner);
      if (partner.option == 'yes') {
        res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_PARTNER_PENSION_URL));
      } else {
        disabilityService.getDisability(req.params.id).then((response) => {
          if (response && response.option == 'yes') {
            res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_PARTNER_DISABILITY_URL));
          } else {
            res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_DEPENDANTS_URL));
          }
        });
      }
    }
  });

export default router;
