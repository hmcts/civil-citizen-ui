import * as express from 'express';
import {CITIZEN_CARER_URL, CITIZEN_EMPLOYMENT_URL} from '../../../urls';
import {ValidationError, Validator} from 'class-validator';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {Carer} from '../../../../common/form/models/statementOfMeans/carer';
import {getCarer, saveCarer} from '../../../../modules/statementOfMeans/carerService';

const carerViewPath = 'features/response/statementOfMeans/carer';
const carerController = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('carerController');
const validator = new Validator();

function renderView(form: Carer, res: express.Response): void {
  res.render(carerViewPath, { form });
}

carerController.get(CITIZEN_CARER_URL, async (req, res) => {
  try {
    const carer: Carer = await getCarer(req.params.id);
    renderView(carer, res);
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error.message });
  }
});

carerController.post(CITIZEN_CARER_URL,
  async (req, res) => {
    const carer: Carer = new Carer(req.body.option);
    const errors: ValidationError[] = validator.validateSync(carer);
    if (errors.length) {
      carer.errors = errors;
      renderView(carer, res);
    } else {
      try {
        await saveCarer(req.params.id, carer);
        res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_EMPLOYMENT_URL));
      } catch (error) {
        logger.error(error);
        res.status(500).send({ error: error.message });
      }
    }
  });

export default carerController;
