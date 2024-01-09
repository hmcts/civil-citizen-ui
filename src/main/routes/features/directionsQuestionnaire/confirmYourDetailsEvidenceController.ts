import {NextFunction, Request, Response, Router} from 'express';
import {GenericForm} from 'form/models/genericForm';
import {ConfirmYourDetailsEvidence} from 'form/models/confirmYourDetailsEvidence';
import {DQ_CONFIRM_YOUR_DETAILS_URL, DQ_DEFENDANT_WITNESSES_URL} from 'routes/urls';
import {
  getConfirmYourDetailsEvidence,
  getConfirmYourDetailsEvidenceForm, saveDirectionQuestionnaire,
} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';

const confirmYourDetailsEvidenceController = Router();
const confirmYourDetailsEvidenceViewPath = 'features/directionsQuestionnaire/confirm-your-details-evidence';
const dqPropertyName = 'confirmYourDetailsEvidence';

function renderView(form: GenericForm<ConfirmYourDetailsEvidence>, res: Response): void {
  res.render(confirmYourDetailsEvidenceViewPath, {form});
}

confirmYourDetailsEvidenceController.get(DQ_CONFIRM_YOUR_DETAILS_URL, async (req, res, next: NextFunction) => {
  try {
    const confirmYourDetailsEvidence = await getConfirmYourDetailsEvidence(generateRedisKey(<AppRequest>req), dqPropertyName);
    renderView(new GenericForm<ConfirmYourDetailsEvidence>(confirmYourDetailsEvidence), res);
  } catch (error) {
    next(error);
  }
});

confirmYourDetailsEvidenceController.post(DQ_CONFIRM_YOUR_DETAILS_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const confirmYourDetailsEvidence = new GenericForm(getConfirmYourDetailsEvidenceForm(req.body));
    confirmYourDetailsEvidence.validateSync();

    if (confirmYourDetailsEvidence.hasErrors()) {
      renderView(confirmYourDetailsEvidence, res);
    } else {
      await saveDirectionQuestionnaire(generateRedisKey(<AppRequest>req), confirmYourDetailsEvidence.model, dqPropertyName);
      res.redirect(constructResponseUrlWithIdParams(claimId, DQ_DEFENDANT_WITNESSES_URL));
    }

  } catch (error) {
    next(error);
  }
});

export default confirmYourDetailsEvidenceController;
