import {NextFunction, Router} from 'express';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {
  getExpertDetails,
  getExpertDetailsForm,
} from '../../../../services/features/directionsQuestionnaire/expertDetailsService';
import {saveDirectionQuestionnaire} from '../../../../services/features/directionsQuestionnaire/directionQuestionnaireService';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {
  DQ_EXPERT_DETAILS_URL,
  DQ_GIVE_EVIDENCE_YOURSELF_URL,
} from '../../../urls';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';
import {ExpertDetails} from 'models/directionsQuestionnaire/experts/expertDetails';

const expertDetailsController = Router();
const expertDetailsViewPath = 'features/directionsQuestionnaire/experts/expert-details';
const dqPropertyName = 'expertDetailsList';
const dqParentName = 'experts';

expertDetailsController.get(DQ_EXPERT_DETAILS_URL, async (req, res, next: NextFunction) => {
  try {
    const form = new GenericForm(await getExpertDetails(generateRedisKey(<AppRequest>req)));
    res.render(expertDetailsViewPath, {form});
  } catch (error) {
    next(error);
  }
});

expertDetailsController.post(DQ_EXPERT_DETAILS_URL, async (req, res, next: NextFunction) => {
  try {
    const action = req.body.action;
    console.log(action);
    const redisKey = generateRedisKey(<AppRequest>req);
    const expertDetailsList = getExpertDetailsForm(req.body.items);
    const form = new GenericForm(expertDetailsList);
    if (action === 'add_another-expert') {
      form.model.items.push(new ExpertDetails());
      res.render(expertDetailsViewPath, {form});
    } else if (action.startsWith('remove-expert')) {
      const index = action.substring('remove-expert'.length);
      console.log(index);
      form.model.items.splice(Number(index), 1);
      res.render(expertDetailsViewPath, {form});
      //form.model.items.splice()
    } else {
      form.validateSync();
      if (form.hasNestedErrors()) {
        res.render(expertDetailsViewPath, {form});
      } else {
        await saveDirectionQuestionnaire(redisKey, expertDetailsList, dqPropertyName, dqParentName);
        res.redirect(constructResponseUrlWithIdParams(req.params.id, DQ_GIVE_EVIDENCE_YOURSELF_URL));
      }
    }
  } catch (error) {
    next(error);
  }
});

export default expertDetailsController;
