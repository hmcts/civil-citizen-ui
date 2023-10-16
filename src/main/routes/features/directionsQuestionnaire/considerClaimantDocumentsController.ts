import {NextFunction, Request, Response, Router} from 'express';
import {DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL, DQ_DEFENDANT_EXPERT_EVIDENCE_URL} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {
  ConsiderClaimantDocuments,
} from '../../../common/models/directionsQuestionnaire/hearing/considerClaimantDocuments';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {
  getDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from '../../../services/features/directionsQuestionnaire/directionQuestionnaireService';
import {YesNo} from '../../../common/form/models/yesNo';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';

const considerClaimantDocumentsController = Router();
const considerClaimantDocumentsViewPath = 'features/directionsQuestionnaire/consider-claimant-documents';
const dqPropertyName = 'considerClaimantDocuments';
const dqParentName = 'hearing';

function renderView(form: GenericForm<ConsiderClaimantDocuments>, res: Response): void {
  res.render(considerClaimantDocumentsViewPath, {form});
}

considerClaimantDocumentsController.get(DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const directionQuestionnaire = await getDirectionQuestionnaire(generateRedisKey(<AppRequest>req));
    const considerClaimantDocuments = directionQuestionnaire.hearing?.considerClaimantDocuments ?
      directionQuestionnaire.hearing.considerClaimantDocuments : new ConsiderClaimantDocuments();

    renderView(new GenericForm(considerClaimantDocuments), res);
  } catch (error) {
    next(error);
  }
});

considerClaimantDocumentsController.post(DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const details = req.body.option === YesNo.YES ? req.body.details : undefined;
    const considerClaimantDocuments = new GenericForm(new ConsiderClaimantDocuments(req.body.option, details));
    considerClaimantDocuments.validateSync();

    if (considerClaimantDocuments.hasErrors()) {
      renderView(considerClaimantDocuments, res);
    } else {
      await saveDirectionQuestionnaire(generateRedisKey(<AppRequest>req), considerClaimantDocuments.model, dqPropertyName, dqParentName);
      res.redirect(constructResponseUrlWithIdParams(claimId, DQ_DEFENDANT_EXPERT_EVIDENCE_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default considerClaimantDocumentsController;
