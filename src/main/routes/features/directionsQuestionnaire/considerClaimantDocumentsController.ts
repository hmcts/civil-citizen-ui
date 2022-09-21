import * as express from 'express';
import {
  DQ_CONSIDER_CLAIMANT_DOCUMENTS,
  DQ_DEFENDANT_EXPERT_EVIDENCE,
} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {ConsiderClaimantDocuments} from '../../../common/models/directionsQuestionnaire/considerClaimantDocuments';
import {
  getConsiderClaimantDocuments, getConsiderClaimantDocumentsForm, saveConsiderClaimantDocuments,
} from '../../../services/features/directionsQuestionnaire/considerClaimantDocumentsService';

const considerClaimantDocumentsController = express.Router();
const considerClaimantDocumentsViewPath = 'features/directionsQuestionnaire/consider-claimant-documents';

function renderView(form: GenericForm<ConsiderClaimantDocuments>, res: express.Response): void {
  res.render(considerClaimantDocumentsViewPath, {form});
}

considerClaimantDocumentsController.get(DQ_CONSIDER_CLAIMANT_DOCUMENTS, async (req:express.Request, res:express.Response, next: express.NextFunction) => {
  try {
    renderView(new GenericForm(await getConsiderClaimantDocuments(req.params.id)), res);
  } catch (error) {
    next(error);
  }
});

considerClaimantDocumentsController.post(DQ_CONSIDER_CLAIMANT_DOCUMENTS, async (req:express.Request, res:express.Response, next: express.NextFunction) => {
  try {
    const claimId = req.params.id;
    const considerClaimantDocumentsForm = getConsiderClaimantDocumentsForm(req.body.option, req.body.details);
    const form = new GenericForm(considerClaimantDocumentsForm);
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveConsiderClaimantDocuments(claimId, considerClaimantDocumentsForm);
      res.redirect(DQ_DEFENDANT_EXPERT_EVIDENCE);
    }
  } catch (error) {
    next(error);
  }
});

export default considerClaimantDocumentsController;
