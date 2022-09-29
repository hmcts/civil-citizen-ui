import * as express from 'express';
import {
  DQ_DEFENDANT_CAN_STILL_EXAMINE_URL,
  DQ_DEFENDANT_EXPERT_REPORTS_URL,
  DQ_GIVE_EVIDENCE_YOURSELF_URL,
} from '../../urls';
import {
  getDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from '../../../services/features/directionsQuestionnaire/directionQuestionnaireService';
import {GenericForm} from '../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {YesNo} from '../../../common/form/models/yesNo';
import {ExpertCanStillExamine} from '../../../common/models/directionsQuestionnaire/experts/expertCanStillExamine';

const expertCanStillExamineController = express.Router();
const expertCanStillExamineViewPath = 'features/directionsQuestionnaire/defendant-expert-can-still-examine';

function renderView(form: GenericForm<ExpertCanStillExamine>, res: express.Response): void {
  res.render(expertCanStillExamineViewPath, {form});
}

expertCanStillExamineController.get(DQ_DEFENDANT_CAN_STILL_EXAMINE_URL, async (req, res, next: express.NextFunction) => {
  try {
    const directionQuestionnaire = await getDirectionQuestionnaire(req.params.id);
    const expertCanStillExamine = directionQuestionnaire.expertCanStillExamine ? new ExpertCanStillExamine(directionQuestionnaire.expertCanStillExamine.option, directionQuestionnaire.expertCanStillExamine.details) : new ExpertCanStillExamine();

    renderView(new GenericForm(expertCanStillExamine), res);
  } catch (error) {
    next(error);
  }
});

expertCanStillExamineController.post(DQ_DEFENDANT_CAN_STILL_EXAMINE_URL, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const claimId = req.params.id;
    const expertCanStillExamine = new GenericForm(new ExpertCanStillExamine(req.body.option, req.body.details));
    expertCanStillExamine.validateSync();

    if (expertCanStillExamine.hasErrors()) {
      renderView(expertCanStillExamine, res);
    } else {
      await saveDirectionQuestionnaire(claimId, expertCanStillExamine.model, 'expertCanStillExamine');
      if (req.body.option === YesNo.YES) {
        res.redirect(constructResponseUrlWithIdParams(claimId, DQ_DEFENDANT_EXPERT_REPORTS_URL));
      } else {
        res.redirect(constructResponseUrlWithIdParams(claimId, DQ_GIVE_EVIDENCE_YOURSELF_URL));
      }
    }
  } catch (error) {
    next(error);
  }
});

export default expertCanStillExamineController;
