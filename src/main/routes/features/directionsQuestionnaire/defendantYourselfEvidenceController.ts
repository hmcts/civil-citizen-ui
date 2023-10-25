import {NextFunction, Request, Response, Router} from 'express';
import {DQ_DEFENDANT_WITNESSES_URL, DQ_GIVE_EVIDENCE_YOURSELF_URL} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {
  getGenericOption,
  getGenericOptionForm,
  saveDirectionQuestionnaire,
} from '../../../services/features/directionsQuestionnaire/directionQuestionnaireService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';

const defendantYourselfEvidenceController = Router();
const defendantYourselfEvidenceViewPath = 'features/directionsQuestionnaire/defendant-yourself-evidence';
const dqPropertyName = 'defendantYourselfEvidence';

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(defendantYourselfEvidenceViewPath, {form});
}

defendantYourselfEvidenceController.get(DQ_GIVE_EVIDENCE_YOURSELF_URL, async (req, res, next: NextFunction) => {
  try {
    const defendantYourselfEvidence = await getGenericOption(generateRedisKey(<AppRequest>req), dqPropertyName);
    renderView(new GenericForm(defendantYourselfEvidence), res);
  } catch (error) {
    next(error);
  }
});

defendantYourselfEvidenceController.post(DQ_GIVE_EVIDENCE_YOURSELF_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const defendantYourselfEvidence = new GenericForm(getGenericOptionForm(req.body.option, dqPropertyName));
    defendantYourselfEvidence.validateSync();

    if (defendantYourselfEvidence.hasErrors()) {
      renderView(defendantYourselfEvidence, res);
    } else {
      await saveDirectionQuestionnaire(generateRedisKey(<AppRequest>req), defendantYourselfEvidence.model, dqPropertyName);
      res.redirect(constructResponseUrlWithIdParams(claimId, DQ_DEFENDANT_WITNESSES_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default defendantYourselfEvidenceController;
