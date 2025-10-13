import {RequestHandler, Response, Router} from 'express';
import {DQ_EXPERT_DETAILS_URL, DQ_SHARE_AN_EXPERT_URL} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericYesNo} from 'form/models/genericYesNo';
import {
  getGenericOption,
  getGenericOptionFormDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {AppRequest} from 'common/models/AppRequest';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';

const sharedExpertController = Router();
const dqPropertyName = 'sharedExpert';
const dqParentName = 'experts';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('sharedExpertController');

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render('features/directionsQuestionnaire/experts/shared-expert', {form, pageTitle: 'PAGES.SHARED_EXPERT.TITLE'});
}

sharedExpertController.get(DQ_SHARE_AN_EXPERT_URL, (async (req, res, next) => {
  try {
    renderView(new GenericForm(await getGenericOption(generateRedisKey(<AppRequest>req), dqPropertyName, dqParentName)), res);
  } catch (error) {
    logger.error(`Error when GET : shared expert - ${error.message}`);
    next(error);
  }
})as RequestHandler);

sharedExpertController.post(DQ_SHARE_AN_EXPERT_URL, (async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const form = new GenericForm(getGenericOptionFormDirectionQuestionnaire(req.body.option, dqPropertyName));
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveDirectionQuestionnaire(generateRedisKey(<AppRequest>req), form.model, dqPropertyName, dqParentName);
      res.redirect(constructResponseUrlWithIdParams(claimId, DQ_EXPERT_DETAILS_URL));
    }
  } catch (error) {
    logger.error(`Error when POST : shared expert - ${error.message}`);
    next(error);
  }
})as RequestHandler);

export default sharedExpertController;
