import * as express from 'express';
import {DQ_DEFENDANT_WITNESSES_URL, DQ_DEFENDANT_YOURSELF_EVIDENCE_URL} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {
  getGenericOption,
  getGenericOptionForm,
  saveDirectionQuestionnaire,
} from '../../../services/features/directionsQuestionnaire/directionQuestionnaireService';

const defendantYourselfEvidenceController = express.Router();
const defendantYourselfEvidenceViewPath = 'features/directionsQuestionnaire/defendant-yourself-evidence';
const dqPropertyName = 'defendantYourselfEvidence';
const errorMessage = 'ERRORS.DEFENDANT_YOURSELF_EVIDENCE_REQUIRED';

function renderView(form: GenericForm<GenericYesNo>, res: express.Response): void {
  res.render(defendantYourselfEvidenceViewPath, {form});
}

defendantYourselfEvidenceController.get(DQ_DEFENDANT_YOURSELF_EVIDENCE_URL, async (req, res, next: express.NextFunction) => {
  try {
    const defendantYourselfEvidence = await getGenericOption(req.params.id, dqPropertyName, errorMessage);
    renderView(new GenericForm(defendantYourselfEvidence), res);
  } catch (error) {
    next(error);
  }
});

defendantYourselfEvidenceController.post(DQ_DEFENDANT_YOURSELF_EVIDENCE_URL, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const claimId = req.params.id;
    const defendantYourselfEvidence = new GenericForm(getGenericOptionForm(req.body.option, errorMessage));
    defendantYourselfEvidence.validateSync();

    if (defendantYourselfEvidence.hasErrors()) {
      renderView(defendantYourselfEvidence, res);
    } else {
      await saveDirectionQuestionnaire(claimId, defendantYourselfEvidence.model, dqPropertyName);
      res.redirect(constructResponseUrlWithIdParams(claimId, DQ_DEFENDANT_WITNESSES_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default defendantYourselfEvidenceController;
