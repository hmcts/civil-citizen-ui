import {RequestHandler, Response, Router} from 'express';
import {
  DQ_EXPERT_CAN_STILL_EXAMINE_URL,
  DQ_GIVE_EVIDENCE_YOURSELF_URL,
  PERMISSION_FOR_EXPERT_URL,
} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {
  getGenericOption,
  getGenericOptionFormDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';

const permissionForExpertController = Router();
const permissionForExpertViewPath = 'features/directionsQuestionnaire/experts/permission-for-expert';
const dqPropertyName = 'permissionForExpert';
const dqParentName = 'experts';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('permissionForExpertController');

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(permissionForExpertViewPath, {form, pageTitle: 'PAGES.PERMISSION_FOR_EXPERT.TITLE'});
}

permissionForExpertController.get(PERMISSION_FOR_EXPERT_URL, (async (req, res, next) => {
  try {
    const permissionForExpert = await getGenericOption(generateRedisKey(<AppRequest>req), dqPropertyName, dqParentName);
    renderView(new GenericForm(permissionForExpert), res);
  } catch (error) {
    logger.error(`Error when GET : permission for experts - ${error.message}`);
    next(error);
  }
}) as RequestHandler);

permissionForExpertController.post(PERMISSION_FOR_EXPERT_URL, (async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const permissionForExpert = new GenericForm(getGenericOptionFormDirectionQuestionnaire(req.body.option, dqPropertyName));
    permissionForExpert.validateSync();

    if (permissionForExpert.hasErrors()) {
      renderView(permissionForExpert, res);
    } else {
      await saveDirectionQuestionnaire(generateRedisKey(<AppRequest>req), permissionForExpert.model, dqPropertyName, dqParentName);
      (permissionForExpert.model.option === YesNo.YES) ?
        res.redirect(constructResponseUrlWithIdParams(claimId, DQ_EXPERT_CAN_STILL_EXAMINE_URL)) :
        res.redirect(constructResponseUrlWithIdParams(claimId, DQ_GIVE_EVIDENCE_YOURSELF_URL));
    }
  } catch (error) {
    logger.error(`Error when POST : permission for experts - ${error.message}`);
    next(error);
  }
}) as RequestHandler);

export default permissionForExpertController;
