import {NextFunction, Request, Response, RequestHandler, Router} from 'express';
import {CP_UPLOAD_DOCUMENTS_URL, DEFENDANT_SUMMARY_URL} from '../../urls';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {getWitnessContent} from 'services/features/caseProgression/witnessService';
import {
  getDisclosureContent,
} from 'services/features/caseProgression/disclosureService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'form/models/genericForm';
import {
  getUploadDocumentsForm,
} from 'services/features/caseProgression/caseProgressionService';
import {UploadDocumentsUserForm} from 'models/caseProgression/uploadDocumentsUserForm';
const multer = require('multer');

const uploadDocumentsViewPath = 'features/caseProgression/upload-documents';
const uploadDocumentsController = Router();
const storage = multer.memoryStorage();
const upload = multer({storage: storage});

async function renderView(res: Response, claimId: string, form: GenericForm<UploadDocumentsUserForm> = null) {
  const claim: Claim = await getCaseDataFromStore(claimId);
  const latestUploadUrl = constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL);
  const uploadDocumentControllerUrl =
  if (claim && !claim.isEmpty()) {
    const disclosureContent = getDisclosureContent(claim, form);
    const witnessContent = getWitnessContent(claimId, claim);
    const expertContent: string = undefined; //TODO = getExpertContent(claim, claimId);
    const trialContent: string = undefined; //TODO = getTrialContent(claim, claimId);
    res.render(uploadDocumentsViewPath, {
      form,
      claim,
      claimId,
      disclosureContent,
      witnessContent,
      expertContent,
      trialContent,
      latestUploadUrl,
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
      console.log('Evidence upload form validated');
      await renderView(res, claimId, form);
      //todo: save to redis
      //todo: next page
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);
uploadDocumentsController.post('/document-upload', upload.any() ,function(req, res) {

  const uploadDocumentsForm = getUploadDocumentsForm(req);

  console.log(uploadDocumentsForm);

  res.sendStatus(200);
});
export default uploadDocumentsController;
