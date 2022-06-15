import * as express from 'express';
import { Evidence, INIT_ROW_COUNT } from '../../../../common/form/models/evidence/evidence';
import { EvidenceItem } from '../../../../common/form/models/evidence/evidenceItem';
import { constructResponseUrlWithIdParams } from '../../../../common/utils/urlFormatter';
import {
  getEvidence,
  saveEvidence,
} from '../../../../services/features/response/evidence/evidenceService';
import {
  CITIZEN_EVIDENCE_URL,
  IMPACT_OF_DISPUTE_URL,
  CLAIM_TASK_LIST_URL,
} from '../../../urls';
import { GenericForm } from '../../../../common/form/models/genericForm';
import { Claim } from '../../../../common/models/claim';
import {getCaseDataFromStore} from '../../../../modules/draft-store/draftStoreService';


const evidenceViewPath = 'features/response/evidence/evidences';
const evidenceController = express.Router();

function renderView(form: GenericForm<Evidence>, res: express.Response): void {
  res.render(evidenceViewPath, { form });
}

evidenceController.get(CITIZEN_EVIDENCE_URL, async (req, res) => {
  try {
    const form: Evidence = await getEvidence(req.params.id);
    if (form.evidenceItem.length < INIT_ROW_COUNT) {
      form.setRows(INIT_ROW_COUNT - form.evidenceItem.length);
    }
    renderView(new GenericForm<Evidence>(form), res);
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

evidenceController.post(CITIZEN_EVIDENCE_URL, async (req: express.Request, res: express.Response) => {
  try {
    let form: GenericForm<Evidence>;
    form = new GenericForm(new Evidence(req.body.comment, transformToEvidences(req)));
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      form = new GenericForm(new Evidence(req.body.comment, removeEmptyValueToEvidences(req)));
      await saveEvidence(req.params.id, form.model);

      const claim = await getCaseDataFromStore(req.params.id) || new Claim();
      if (claim.respondent1.responseType === 'PART_ADMISSION') {
        res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
      } else {
        res.redirect(constructResponseUrlWithIdParams(req.params.id, IMPACT_OF_DISPUTE_URL));
      }
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});


function transformToEvidences(req: express.Request): EvidenceItem[] {
  return req.body.evidenceItem.map((item: EvidenceItem) => {
    return new EvidenceItem(item.type, item.description);
  });
}

function removeEmptyValueToEvidences(req: express.Request): EvidenceItem[] {
  return req.body.evidenceItem
    .filter((item: EvidenceItem) => item.type)
    .map((item: EvidenceItem) => {
      return new EvidenceItem(item.type, item.description);
    });
}

export default evidenceController;
