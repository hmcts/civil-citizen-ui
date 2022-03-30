import * as express from 'express';
import {
  CITIZEN_OTHER_DEPENDANTS_URL,
  CITIZEN_EMPLOYMENT_URL,
} from '../../../../urls';
import {OtherDependants} from '../../../../../common/form/models/statementOfMeans/otherDependants';
import {ValidationError, Validator} from 'class-validator';
import {OtherDependantsService} from '../../../../../modules/statementOfMeans/otherDependants/otherDependantsService';
import { constructResponseUrlWithIdParams } from '../../../../../common/utils/urlFormatter';

const citizenOtherDependantsViewPath = 'features/response/statementOfMeans/otherDependants/other-dependants';
const router = express.Router();

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('otherDependantsController');

const otherDependantsService = new OtherDependantsService();

function renderView(form: OtherDependants, res: express.Response): void {
  res.render(citizenOtherDependantsViewPath, {form});
}

router.get(CITIZEN_OTHER_DEPENDANTS_URL, async (req, res) => {
  try {
    const response = await otherDependantsService.getOtherDependants(req.params.id);
    const otherDependants = response ? new OtherDependants(response.option, response.numberOfPeople, response.details) : new OtherDependants();
    renderView(otherDependants, res);
  } catch (error) {
    logger.error(`${error.stack || error}`);
    res.status(500).send({error: error.message});
  }
});

router.post(CITIZEN_OTHER_DEPENDANTS_URL,
  async (req, res) => {
    try{
      const otherDependants: OtherDependants = new OtherDependants(
        req.body.option, req.body.numberOfPeople, req.body.details);
      const validator = new Validator();
      const errors: ValidationError[] = validator.validateSync(otherDependants);
      if (errors && errors.length > 0) {
        otherDependants.errors = errors;
        renderView(otherDependants, res);
      } else {
        await otherDependantsService.saveOtherDependants(req.params.id, otherDependants);
        res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_EMPLOYMENT_URL));
      }
    } catch (error) {
      logger.error(`${error.stack || error}`);
      res.status(500).send({error: error.message});
    }
  });

export default router;
