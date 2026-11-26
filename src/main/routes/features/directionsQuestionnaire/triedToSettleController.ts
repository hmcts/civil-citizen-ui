import {RequestHandler, Response, Router} from 'express';
import {DQ_REQUEST_EXTRA_4WEEKS_URL, DQ_TRIED_TO_SETTLE_CLAIM_URL} from '../../urls';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericYesNo} from 'form/models/genericYesNo';
import {
  getGenericOption,
  getGenericOptionFormDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {AppRequest} from 'common/models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';

const triedToSettleController = Router();
const dqPropertyName = 'triedToSettle';
const dqParentName = 'hearing';

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render('features/directionsQuestionnaire/tried-to-settle-claim', {form, pageTitle: 'PAGES.TRIED_TO_SETTLE.TITLE'});
}

triedToSettleController.get(DQ_TRIED_TO_SETTLE_CLAIM_URL, (async (req, res, next) => {
  try {
    renderView(new GenericForm(await getGenericOption(<AppRequest>req, dqPropertyName, dqParentName)), res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

triedToSettleController.post(DQ_TRIED_TO_SETTLE_CLAIM_URL, (async (req, res, next) => {
  try {
    const claimId = getRouteParam(<AppRequest>req, 'id');
    const triedToSettle = getGenericOptionFormDirectionQuestionnaire(req.body.option, dqPropertyName);
    const form = new GenericForm(triedToSettle);
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveDirectionQuestionnaire(<AppRequest>req, form.model, dqPropertyName, dqParentName);
      res.redirect(constructResponseUrlWithIdParams(claimId, DQ_REQUEST_EXTRA_4WEEKS_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default triedToSettleController;
