import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {Evidence} from 'form/models/evidence/evidence'; //buildEmptyForm
import {
  getClaimDetails,
  saveClaimDetails,
} from 'services/features/claim/details/claimDetailsService';
import * as utilEvidence from '../../../../common/form/models/evidence/transformAndRemoveEmptyValues';
import {
  CLAIM_EVIDENCE_URL,
  CLAIMANT_TASK_LIST_URL,
} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {AppRequest} from 'models/AppRequest';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';

const evidenceViewPath = 'features/claim/claimant-evidences';
const evidenceController = Router();

function renderView(form: GenericForm<Evidence>, res: Response): void {
  res.render(evidenceViewPath, {form});
}

evidenceController.get(CLAIM_EVIDENCE_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimDetails: ClaimDetails = await getClaimDetails(req.session.user?.id);
    Evidence.buildForm(claimDetails);
    renderView(new GenericForm<Evidence>(claimDetails.evidence), res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

evidenceController.post(CLAIM_EVIDENCE_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const form = new GenericForm(new Evidence('', utilEvidence.transformToEvidences(req.body)));
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      const claimId = (<AppRequest>req).session.user?.id;
      form.model.evidenceItem = utilEvidence.removeEmptyValueToEvidences(req.body);
      await saveClaimDetails(claimId, form.model, 'evidence');
      res.redirect(CLAIMANT_TASK_LIST_URL);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default evidenceController;
