import * as express from 'express';
import {
  DQ_DEFENDANT_EXPERT_EVIDENCE_URL,
  DQ_DEFENDANT_EXPERT_REPORTS_URL,
  DQ_DEFENDANT_YOURSELF_EVIDENCE_URL,
} from '../../urls';
import {
  saveDirectionQuestionnaire,
} from '../../../services/features/directionsQuestionnaire/directionQuestionnaireService';
import {GenericForm} from '../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {YesNo} from '../../../common/form/models/yesNo';
import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {
  getExpertEvidence,
  getExpertEvidenceForm,
} from '../../../services/features/directionsQuestionnaire/defendantExpertEvidenceService';

const defendantExpertEvidenceController = express.Router();
const defendantExpertEvidenceViewPath = 'features/directionsQuestionnaire/defendant-expert-evidence';

function renderView(form: GenericForm<GenericYesNo>, res: express.Response): void {
  res.render(defendantExpertEvidenceViewPath, {form});
}

defendantExpertEvidenceController.get(DQ_DEFENDANT_EXPERT_EVIDENCE_URL, async (req, res, next: express.NextFunction) => {
  try {
    const defendantExpertEvidence = await getExpertEvidence(req.params.id);
    renderView(new GenericForm(defendantExpertEvidence), res);
  } catch (error) {
    next(error);
  }
});

defendantExpertEvidenceController.post(DQ_DEFENDANT_EXPERT_EVIDENCE_URL, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const claimId = req.params.id;
    const defendantExpertEvidence = new GenericForm(getExpertEvidenceForm(req.body.option));
    defendantExpertEvidence.validateSync();

    if (defendantExpertEvidence.hasErrors()) {
      renderView(defendantExpertEvidence, res);
    } else {
      defendantExpertEvidence.model.option = req.body.option;
      await saveDirectionQuestionnaire(claimId, defendantExpertEvidence.model, 'defendantExpertEvidence');
      if (req.body.option === YesNo.YES) {
        res.redirect(constructResponseUrlWithIdParams(claimId, DQ_DEFENDANT_EXPERT_REPORTS_URL));
      } else {
        res.redirect(constructResponseUrlWithIdParams(claimId, DQ_DEFENDANT_YOURSELF_EVIDENCE_URL));
      }
    }
  } catch (error) {
    next(error);
  }
});

export default defendantExpertEvidenceController;
