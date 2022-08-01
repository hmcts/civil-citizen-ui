import * as express from 'express';
import {CITIZEN_CARER_URL, CITIZEN_EMPLOYMENT_URL} from '../../../urls';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {Carer} from '../../../../common/form/models/statementOfMeans/carer';
import {getCarer, saveCarer} from '../../../../services/features/response/statementOfMeans/carerService';
import {GenericForm} from '../../../../common/form/models/genericForm';

const carerViewPath = 'features/response/statementOfMeans/carer';
const carerController = express.Router();

function renderView(form: GenericForm<Carer>, res: express.Response): void {
  res.render(carerViewPath, { form });
}

carerController.get(CITIZEN_CARER_URL, async (req, res, next: express.NextFunction) => {
  try {
    const carerForm: Carer = await getCarer(req.params.id);
    renderView(new GenericForm(carerForm), res);
  } catch (error) {
    next(error);
  }
});

carerController.post(CITIZEN_CARER_URL,
  async (req, res, next: express.NextFunction) => {
    const carerForm: GenericForm<Carer> = new GenericForm(new Carer(req.body.option));
    carerForm.validateSync();
    if (carerForm.hasErrors()) {
      renderView(carerForm, res);
    } else {
      try {
        await saveCarer(req.params.id, carerForm.model);
        res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_EMPLOYMENT_URL));
      } catch (error) {
        next(error);
      }
    }
  });

export default carerController;
