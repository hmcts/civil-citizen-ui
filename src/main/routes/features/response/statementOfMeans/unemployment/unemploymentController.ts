import * as express from 'express';
import {CITIZEN_COURT_ORDERS_PAGE_URL, CITIZEN_UNEMPLOYED_URL} from '../../../../../routes/urls';
import {validateForm} from '../../../../../common/form/validators/formValidator';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {Unemployment} from '../../../../../common/form/models/statementOfMeans/unemployment/unemployment';
import {UnemploymentDetails} from '../../../../../common/form/models/statementOfMeans/unemployment/unemploymentDetails';
import {OtherDetails} from '../../../../../common/form/models/statementOfMeans/unemployment/otherDetails';
import {
  getUnemployment,
  saveUnemployment,
} from '../../../../../modules/statementOfMeans/unemployment/unemploymentService';
import {
  UnemploymentCategory,
} from '../../../../../common/form/models/statementOfMeans/unemployment/unemploymentCategory';

const citizenEmploymentStatusViewPath = 'features/response/statementOfMeans/unemployment';
const unemploymentController = express.Router();

function renderView(form: Unemployment, res: express.Response): void {
  res.render(citizenEmploymentStatusViewPath, {form: form, UnemploymentCategory: UnemploymentCategory});
}

unemploymentController.get(CITIZEN_UNEMPLOYED_URL, async (req, res) => {
  try {
    const unemployment = await getUnemployment(req.params.id);
    renderView(unemployment, res);
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

unemploymentController.post(CITIZEN_UNEMPLOYED_URL, async (req, res) => {
  try {
    const form = new Unemployment(req.body.option, new UnemploymentDetails(req.body.years, req.body.months), new OtherDetails(req.body.details));
    await validateForm(form);
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveUnemployment(req.params.id, form);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_COURT_ORDERS_PAGE_URL));
    }
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

export default unemploymentController;
