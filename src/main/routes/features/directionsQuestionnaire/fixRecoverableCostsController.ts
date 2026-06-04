import {RequestHandler, Response, Router} from 'express';
import {
  DQ_FIX_RECOVERABLE_COSTS_URL,
} from '../../urls';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';

import {
  getGenericOption,
  getGenericOptionFormDirectionQuestionnaire,
} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';


const fixRecoverableCostsController = Router();
const dqPropertyName = 'requestExtra4weeks';
const dqParentName = 'hearing';

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render('features/directionsQuestionnaire/fix-recoverable-costs', {form, pageTitle: 'PAGES.FIX_RECOVERABLE_COSTS.PAGE_TITLE'});
}

fixRecoverableCostsController.get(DQ_FIX_RECOVERABLE_COSTS_URL, (async (req, res, next) => {
  try {
    renderView(new GenericForm(await getGenericOption(generateRedisKey(<AppRequest>req), dqPropertyName, dqParentName)), res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

fixRecoverableCostsController.post(DQ_FIX_RECOVERABLE_COSTS_URL, (async (req, res, next) => {
  try {
    const form = new GenericForm(getGenericOptionFormDirectionQuestionnaire(req.body.option, dqPropertyName));
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default fixRecoverableCostsController;
