import * as express from 'express';
import { CITIZEN_DISABILITY_URL, CITIZEN_RESIDENCE_URL, CITIZEN_SEVERELY_DISABLED_URL } from '../../../urls';
import { Disability } from '../../../../common/form/models/statementOfMeans/disability';
import { ValidationError, Validator } from 'class-validator';
import { DisabilityService } from '../../../../modules/statementOfMeans/disabilityService';
import { constructResponseUrlWithIdParams } from '../../../../common/utils/urlFormatter';

const citizenDisabilityViewPath = 'features/response/statementOfMeans/disability';
const router = express.Router();
const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('disabilityService');
const disabilityService = new DisabilityService();
const validator = new Validator();

function renderView(form: Disability, res: express.Response): void {
  res.render(citizenDisabilityViewPath, { form });
}

router.get(CITIZEN_DISABILITY_URL, async (req, res) => {
  try {
    const disability = await disabilityService.getDisability(req.params.id);
    renderView(disability, res);
  } catch (error) {
    logger.error(`${error as Error || error}`);
    res.status(500).send({ error: error.message });
  }
});

router.post(CITIZEN_DISABILITY_URL,
  async (req, res) => {
    const disability: Disability = new Disability(req.body.disability);
    const errors: ValidationError[] = validator.validateSync(disability);
    if (errors && errors.length > 0) {
      disability.errors = errors;
      renderView(disability, res);
    } else {
      try {
        await disabilityService.saveDisability(req.params.id, disability);
        if (disability.option == 'yes') {
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_SEVERELY_DISABLED_URL));
        } else {
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_RESIDENCE_URL));
        }
      } catch (error) {
        logger.error(`${error as Error || error}`);
        res.status(500).send({ error: error.message });
      }
    }
  });

export default router;
