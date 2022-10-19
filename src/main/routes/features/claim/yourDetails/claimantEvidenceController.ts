import {NextFunction, Request, Response, Router} from 'express';
import {Evidence,INIT_ROW_COUNT} from '../../../../common/form/models/evidence/evidence';
import {
  getClaimDetails,
  saveClaimDetails,
} from '../../../../services/features/claim/details/claimDetailsService';
import * as utilEvidence from '../../../../common/form/models/evidence/transformAndRemoveEmptyValues';
import {
  CLAIM_EVIDENCE_URL,
  CLAIMANT_TASK_LIST_URL,
} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {AppRequest} from '../../../../common/models/AppRequest';
import {ClaimDetails} from '../../../../common/form/models/claim/details/claimDetails';

const evidenceViewPath = 'features/claim/claimant-evidences';
const evidenceController = Router();

function renderView(form: GenericForm<Evidence>, res: Response): void {
  res.render(evidenceViewPath, {form});
}

evidenceController.get(CLAIM_EVIDENCE_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimDetails: ClaimDetails = await getClaimDetails(req.session.user?.id);
    getEvidence(claimDetails);
    renderView(new GenericForm<Evidence>(claimDetails.evidence), res);
  } catch (error) {
    next(error);
  }
});

evidenceController.post(CLAIM_EVIDENCE_URL, async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    let form = new GenericForm(new Evidence('', utilEvidence.transformToEvidences(req.body)));
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      const appRequest = <AppRequest>req;
      form = new GenericForm(new Evidence('', utilEvidence.removeEmptyValueToEvidences(req.body)));
      await saveClaimDetails(appRequest.session.user?.id, form.model,'evidence');
      res.redirect(CLAIMANT_TASK_LIST_URL);
    }
  } catch (error) {
    next(error);
  }
});

const getEvidence = (claimDetails: ClaimDetails) => {
  if (claimDetails.evidence) {
    claimDetails.evidence = new Evidence(claimDetails.evidence.comment,claimDetails.evidence.evidenceItem);
    if (claimDetails.evidence.evidenceItem.length < INIT_ROW_COUNT) {
      claimDetails.evidence.setRows(INIT_ROW_COUNT - claimDetails.evidence.evidenceItem.length);
    }
  } else {
    claimDetails.evidence = new Evidence();
  }
};

export default evidenceController;
