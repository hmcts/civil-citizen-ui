import {NextFunction, RequestHandler, Router} from 'express';
import {GenericForm} from 'form/models/genericForm';
import {
  getExpertDetails,
  getExpertDetailsForm,
} from 'services/features/directionsQuestionnaire/expertDetailsService';
import {saveDirectionQuestionnaire} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  DQ_EXPERT_DETAILS_URL,
  DQ_GIVE_EVIDENCE_YOURSELF_URL,
} from 'routes/urls';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';

const expertDetailsController = Router();
const expertDetailsViewPath = 'features/directionsQuestionnaire/experts/expert-details';
const dqPropertyName = 'expertDetailsList';
const dqParentName = 'experts';
const pageTitle= 'PAGES.EXPERT_DETAILS.PAGE_TITLE';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('expertDetailsController');

expertDetailsController.get(DQ_EXPERT_DETAILS_URL, (async (req, res, next: NextFunction) => {
  try {
    const form = new GenericForm(await getExpertDetails(generateRedisKey(<AppRequest>req)));
    res.render(expertDetailsViewPath, {form, pageTitle});
  } catch (error) {
    logger.error(`Error when GET : expert details - ${error.message}`);
    next(error);
  }
}) as RequestHandler);

expertDetailsController.post(DQ_EXPERT_DETAILS_URL, (async (req, res, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const expertDetailsList = getExpertDetailsForm(req.body.items);
    const form = new GenericForm(expertDetailsList);
    await form.validate();
    form.validateSync();

    if (form.hasNestedErrors()) {
      logger.info('Nested errors found');
      res.render(expertDetailsViewPath, {form, pageTitle});
    } else {
      logger.info('No nested errors found');
      await saveDirectionQuestionnaire(redisKey, expertDetailsList, dqPropertyName, dqParentName);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, DQ_GIVE_EVIDENCE_YOURSELF_URL));
    }
  } catch (error) {
    logger.error(`Error when POST : expert details - ${error.message}`);
    next(error);
  }
}) as RequestHandler);

export default expertDetailsController;
