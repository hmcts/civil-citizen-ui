import * as express from 'express';
import {CITIZEN_CARER_URL, CITIZEN_EMPLOYMENT_URL} from '../../../urls';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {Carer} from '../../../../common/form/models/statementOfMeans/carer';
import {getCarer, saveCarer} from '../../../../modules/statementOfMeans/carerService';
import {validateForm} from '../../../../common/form/validators/formValidator';

const carerViewPath = 'features/response/statementOfMeans/carer';
const carerController = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('carerController');

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
    await validateForm(carer);
    if (carer.hasErrors()) {
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
