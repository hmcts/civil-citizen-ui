import {NextFunction, Request, Response, Router} from 'express';
import {
  DQ_DEFENDANT_EXPERT_EVIDENCE_URL,
  DQ_GIVE_EVIDENCE_YOURSELF_URL,
  DQ_SENT_EXPERT_REPORTS_URL,
} from '../../../urls';
import {
  getGenericOption,
  getGenericOptionFormDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from '../../../../services/features/directionsQuestionnaire/directionQuestionnaireService';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {YesNo} from '../../../../common/form/models/yesNo';
import {GenericYesNo} from '../../../../common/form/models/genericYesNo';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';

const expertEvidenceController = Router();
const expertEvidenceViewPath = 'features/directionsQuestionnaire/experts/expert-evidence';
const dqPropertyName = 'expertEvidence';
const dqParentName = 'experts';

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(expertEvidenceViewPath, {form});
}

expertEvidenceController.get(DQ_DEFENDANT_EXPERT_EVIDENCE_URL, async (req, res, next: NextFunction) => {
  try {
    const defendantExpertEvidence = await getGenericOption(generateRedisKey(<AppRequest>req), dqPropertyName, dqParentName);
    renderView(new GenericForm(defendantExpertEvidence), res);
  } catch (error) {
    next(error);
  }
});

expertEvidenceController.post(DQ_DEFENDANT_EXPERT_EVIDENCE_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const defendantExpertEvidence = new GenericForm(getGenericOptionFormDirectionQuestionnaire(req.body.option, dqPropertyName));
    defendantExpertEvidence.validateSync();

    if (defendantExpertEvidence.hasErrors()) {
      renderView(defendantExpertEvidence, res);
    } else {
      await saveDirectionQuestionnaire(generateRedisKey(<AppRequest>req), defendantExpertEvidence.model, dqPropertyName, dqParentName);
      (defendantExpertEvidence.model.option === YesNo.YES) ?
        res.redirect(constructResponseUrlWithIdParams(claimId, DQ_SENT_EXPERT_REPORTS_URL)) :
        res.redirect(constructResponseUrlWithIdParams(claimId, DQ_GIVE_EVIDENCE_YOURSELF_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default expertEvidenceController;
