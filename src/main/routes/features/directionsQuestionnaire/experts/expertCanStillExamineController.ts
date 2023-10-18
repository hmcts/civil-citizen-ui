import {NextFunction, Request, Response, Router} from 'express';
import {
  DQ_EXPERT_CAN_STILL_EXAMINE_URL,
  DQ_EXPERT_DETAILS_URL,
  DQ_GIVE_EVIDENCE_YOURSELF_URL,
} from '../../../urls';
import {
  getDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from '../../../../services/features/directionsQuestionnaire/directionQuestionnaireService';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {YesNo} from '../../../../common/form/models/yesNo';
import {ExpertCanStillExamine} from '../../../../common/models/directionsQuestionnaire/experts/expertCanStillExamine';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';

const expertCanStillExamineController = Router();
const expertCanStillExamineViewPath = 'features/directionsQuestionnaire/experts/defendant-expert-can-still-examine';
const dqPropertyName = 'expertCanStillExamine';
const dqParentName = 'experts';

function renderView(form: GenericForm<ExpertCanStillExamine>, res: Response): void {
  res.render(expertCanStillExamineViewPath, {form});
}

expertCanStillExamineController.get(DQ_EXPERT_CAN_STILL_EXAMINE_URL, async (req, res, next: NextFunction) => {
  try {
    const directionQuestionnaire = await getDirectionQuestionnaire(generateRedisKey(<AppRequest>req));
    const expertCanStillExamine = directionQuestionnaire.experts?.expertCanStillExamine ?
      directionQuestionnaire.experts.expertCanStillExamine : new ExpertCanStillExamine();

    renderView(new GenericForm(expertCanStillExamine), res);
  } catch (error) {
    next(error);
  }
});

expertCanStillExamineController.post(DQ_EXPERT_CAN_STILL_EXAMINE_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const details = req.body.option === YesNo.YES ? req.body.details : undefined;
    const expertCanStillExamine = new GenericForm(new ExpertCanStillExamine(req.body.option, details));
    expertCanStillExamine.validateSync();

    if (expertCanStillExamine.hasErrors()) {
      renderView(expertCanStillExamine, res);
    } else {
      await saveDirectionQuestionnaire(generateRedisKey(<AppRequest>req), expertCanStillExamine.model, dqPropertyName, dqParentName);
      if (req.body.option === YesNo.YES) {
        res.redirect(constructResponseUrlWithIdParams(claimId, DQ_EXPERT_DETAILS_URL));
      } else {
        res.redirect(constructResponseUrlWithIdParams(claimId, DQ_GIVE_EVIDENCE_YOURSELF_URL));
      }
    }
  } catch (error) {
    next(error);
  }
});

export default expertCanStillExamineController;
