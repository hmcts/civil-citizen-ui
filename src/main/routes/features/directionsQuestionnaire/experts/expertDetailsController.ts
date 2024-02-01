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

expertDetailsController.get(DQ_EXPERT_DETAILS_URL, (async (req, res, next: NextFunction) => {
  try {
    const form = new GenericForm(await getExpertDetails(generateRedisKey(<AppRequest>req)));
    res.render(expertDetailsViewPath, {form});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

expertDetailsController.post(DQ_EXPERT_DETAILS_URL, (async (req, res, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const expertDetailsList = getExpertDetailsForm(req.body.items);
    const form = new GenericForm(expertDetailsList);
    form.validateSync();

    if (form.hasNestedErrors()) {
      res.render(expertDetailsViewPath, {form});
    } else {
      await saveDirectionQuestionnaire(redisKey, expertDetailsList, dqPropertyName, dqParentName);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, DQ_GIVE_EVIDENCE_YOURSELF_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default expertDetailsController;
