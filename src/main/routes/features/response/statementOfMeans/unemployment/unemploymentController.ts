import * as express from 'express';
import {CITIZEN_COURT_ORDERS_URL, CITIZEN_UNEMPLOYED_URL} from '../../../../../routes/urls';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {Unemployment} from '../../../../../common/form/models/statementOfMeans/unemployment/unemployment';
import {UnemploymentDetails} from '../../../../../common/form/models/statementOfMeans/unemployment/unemploymentDetails';
import {OtherDetails} from '../../../../../common/form/models/statementOfMeans/unemployment/otherDetails';
import {UnemploymentService} from '../../../../../modules/statementOfMeans/unemployment/unemploymentService';
import {
  UnemploymentCategory,
} from '../../../../../common/form/models/statementOfMeans/unemployment/unemploymentCategory';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {Validator} from 'class-validator';

const citizenEmploymentStatusViewPath = 'features/response/statementOfMeans/unemployment';
const unemploymentController = express.Router();
const validator = new Validator();
const unemploymentService = new UnemploymentService();
let unemployment = new Unemployment();

function renderView(form: GenericForm<Unemployment>, res: express.Response): void {
  res.render(citizenEmploymentStatusViewPath, {form: form, UnemploymentCategory: UnemploymentCategory});
}

unemploymentController.get(CITIZEN_UNEMPLOYED_URL, async (req, res) => {
  try {
    unemployment = await unemploymentService.getUnemployment(req.params.id);
    renderView(new GenericForm(unemployment), res);
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

unemploymentController.post(CITIZEN_UNEMPLOYED_URL, async (req, res) => {
  try {
    const unemploymentToSave = new Unemployment(req.body.option, new UnemploymentDetails(req.body.years, req.body.months), new OtherDetails(req.body.details));
    const unemploymentForm: GenericForm<Unemployment> = new GenericForm(unemploymentToSave);
    unemploymentForm.errors = validator.validateSync(unemploymentForm.model);

    if (unemploymentForm.hasErrors() || unemploymentForm.hasNestedErrors()) {
      renderView(unemploymentForm, res);
    } else {
      await unemploymentService.saveUnemployment(req.params.id, unemploymentToSave);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_COURT_ORDERS_URL));
    }
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

export default unemploymentController;
