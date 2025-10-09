import {RequestHandler, Router} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {EXPERT_GUIDANCE_URL, PERMISSION_FOR_EXPERT_URL} from 'routes/urls';
import {getDirectionQuestionnaire} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';

const expertGuidanceController = Router();

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('expertGuidanceController');

expertGuidanceController.get(EXPERT_GUIDANCE_URL, (async (req, res, next) => {
  try {
    await getDirectionQuestionnaire(generateRedisKey(<AppRequest>req));
    res.render('features/directionsQuestionnaire/experts/expert-guidance', {pageTitle: 'PAGES.EXPERT_GUIDANCE.PAGE_TITLE'});
  } catch (error) {
    logger.error(`Error when GET : expert guidance - ${error.message}`);
    next(error);
  }
}) as RequestHandler);

expertGuidanceController.post(EXPERT_GUIDANCE_URL, ((req, res) => {
  res.redirect(constructResponseUrlWithIdParams(req.params.id, PERMISSION_FOR_EXPERT_URL));
}) as RequestHandler);

export default expertGuidanceController;
