import * as express from 'express';
import {CITIZEN_COURT_ORDERS_PAGE_URL, CITIZEN_UNEMPLOYED_URL} from '../../../../../routes/urls';
import {validateForm} from '../../../../../common/form/validators/formValidator';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {Unemployment} from '../../../../../common/form/models/statementOfMeans/unemployment/unemployment';
import {
  getUnemployment,
  saveUnemployment,
} from '../../../../../modules/statementOfMeans/unemployment/unemploymentService';
import {
  UnemploymentCategory,
} from '../../../../../common/form/models/statementOfMeans/unemployment/unemploymentCategory';


const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('unemploymentController');
const citizenEmploymentStatusViewPath = 'features/response/statementOfMeans/unemployment';
const router = express.Router();

function renderView(form: Unemployment, res: express.Response): void {
  res.render(citizenEmploymentStatusViewPath, {form: form, UnemploymentCategory: UnemploymentCategory});
}

router.get(CITIZEN_UNEMPLOYED_URL, async (req, res) => {
  try {
    const form = await getUnemployment(req.params.id);
    renderView(form, res);
  } catch (error) {
    logger.error(`${(error as Error).stack || error}`);
    res.status(500).send({error: error.message});
  }
});

router.post(CITIZEN_UNEMPLOYED_URL, async (req, res) => {
  const form = new Unemployment(req.body.option, req.body.employmentCategory);
  try {
    await validateForm(form);
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveUnemployment(req.params.id, form);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_COURT_ORDERS_PAGE_URL));
    }
  } catch (error) {
    logger.error(`${(error as Error).stack || error}`);
    res.status(500).send({error: error.message});
  }
});

export default router;
