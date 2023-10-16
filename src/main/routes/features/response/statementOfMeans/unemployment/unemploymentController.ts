import {NextFunction, Response, Router} from 'express';
import {CITIZEN_COURT_ORDERS_URL, CITIZEN_UNEMPLOYED_URL} from '../../../../../routes/urls';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {Unemployment} from '../../../../../common/form/models/statementOfMeans/unemployment/unemployment';
import {UnemploymentDetails} from '../../../../../common/form/models/statementOfMeans/unemployment/unemploymentDetails';
import {OtherDetails} from '../../../../../common/form/models/statementOfMeans/unemployment/otherDetails';
import {UnemploymentService} from '../../../../../services/features/response/statementOfMeans/unemployment/unemploymentService';
import {
  UnemploymentCategory,
} from '../../../../../common/form/models/statementOfMeans/unemployment/unemploymentCategory';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {Validator} from 'class-validator';
import {AppRequest} from 'common/models/AppRequest';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';

const citizenEmploymentStatusViewPath = 'features/response/statementOfMeans/unemployment';
const unemploymentController = Router();
const validator = new Validator();
const unemploymentService = new UnemploymentService();
let unemployment = new Unemployment();

function renderView(form: GenericForm<Unemployment>, res: Response): void {
  res.render(citizenEmploymentStatusViewPath, {form, UnemploymentCategory});
}

unemploymentController.get(CITIZEN_UNEMPLOYED_URL, async (req, res, next: NextFunction) => {
  try {
    unemployment = await unemploymentService.getUnemployment(generateRedisKey(<AppRequest>req));
    renderView(new GenericForm(unemployment), res);
  } catch (error) {
    next(error);
  }
});

unemploymentController.post(CITIZEN_UNEMPLOYED_URL, async (req, res, next: NextFunction) => {
  try {
    const unemploymentToSave = new Unemployment(req.body.option, new UnemploymentDetails(req.body.years, req.body.months), new OtherDetails(req.body.details));
    const unemploymentForm: GenericForm<Unemployment> = new GenericForm(unemploymentToSave);
    unemploymentForm.errors = validator.validateSync(unemploymentForm.model);

    if (unemploymentForm.hasErrors() || unemploymentForm.hasNestedErrors()) {
      renderView(unemploymentForm, res);
    } else {
      await unemploymentService.saveUnemployment(generateRedisKey(<AppRequest>req), unemploymentToSave);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_COURT_ORDERS_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default unemploymentController;
