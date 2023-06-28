import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {CP_CHECK_ANSWERS_URL, CP_EVIDENCE_UPLOAD_CANCEL, CP_UPLOAD_DOCUMENTS_URL} from '../../urls';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {getWitnessContent} from 'services/features/caseProgression/witnessService';
import {getDisclosureContent} from 'services/features/caseProgression/disclosureService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'form/models/genericForm';
import {getUploadDocumentsForm, saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import {UploadDocumentsUserForm} from 'models/caseProgression/uploadDocumentsUserForm';
import {getTrialContent} from 'services/features/caseProgression/trialService';
import {getExpertContent} from 'services/features/caseProgression/expertService';

const uploadDocumentsViewPath = 'features/caseProgression/upload-documents';
const uploadDocumentsController = Router();
const dqPropertyName = 'defendantUploadDocuments';

async function renderView(res: Response, claimId: string, form: GenericForm<UploadDocumentsUserForm> = null) {
  const claim: Claim = await getCaseDataFromStore(claimId);
  const cancelUrl = constructResponseUrlWithIdParams(claimId, CP_EVIDENCE_UPLOAD_CANCEL);

  if (claim && !claim.isEmpty()) {
    const disclosureContent = getDisclosureContent(claim, form);
    const witnessContent = getWitnessContent(claim);
    const expertContent = getExpertContent(claim);
    const trialContent = getTrialContent(claim, form);
    res.render(uploadDocumentsViewPath, {
      form,
      claim,
      claimId,
      disclosureContent,
      witnessContent,
      expertContent,
      trialContent,
      cancelUrl,
    });
  }
}

uploadDocumentsController.get(CP_UPLOAD_DOCUMENTS_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    await renderView(res, claimId, null);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

uploadDocumentsController.post(CP_UPLOAD_DOCUMENTS_URL, (async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const uploadDocumentsForm = getUploadDocumentsForm(req);
    const form = new GenericForm(uploadDocumentsForm);
    form.validateSync();
    if (form.hasErrors()) {
      await renderView(res, claimId, form);
    } else {
      await saveCaseProgression(claimId, form.model, dqPropertyName);
      res.redirect(constructResponseUrlWithIdParams(claimId, CP_CHECK_ANSWERS_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default uploadDocumentsController;
