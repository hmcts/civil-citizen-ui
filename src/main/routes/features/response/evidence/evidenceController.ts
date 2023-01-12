import {NextFunction, Request, Response, Router} from 'express';
import {Evidence, INIT_ROW_COUNT} from '../../../../common/form/models/evidence/evidence';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {
  getEvidence,
  saveEvidence,
} from '../../../../services/features/response/evidence/evidenceService';
import {
  CITIZEN_EVIDENCE_URL,
  CLAIM_TASK_LIST_URL,
} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import * as utilEvidence from '../../../../common/form/models/evidence/transformAndRemoveEmptyValues';

const evidenceViewPath = 'features/response/evidence/evidences';
const evidenceController = Router();

function renderView(form: GenericForm<Evidence>, res: Response): void {
  res.render(evidenceViewPath, {form});
}

evidenceController.get(CITIZEN_EVIDENCE_URL, async (req, res, next: NextFunction) => {
  try {
    const form: Evidence = await getEvidence(req.params.id);
    if (form.evidenceItem.length < INIT_ROW_COUNT) {
      form.setRows(INIT_ROW_COUNT - form.evidenceItem.length);
    }
    renderView(new GenericForm<Evidence>(form), res);
  } catch (error) {
    next(error);
  }
});

evidenceController.post(CITIZEN_EVIDENCE_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    let form: GenericForm<Evidence>;
    form = new GenericForm(new Evidence(req.body.comment, utilEvidence.transformToEvidences(req.body)));
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      form = new GenericForm(new Evidence(req.body.comment, utilEvidence.removeEmptyValueToEvidences(req.body)));
      await saveEvidence(req.params.id, form.model);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default evidenceController;
