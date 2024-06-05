import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  GA_HEARING_ARRANGEMENTS_GUIDANCE,
  GA_UPLOAD_DOCUMENTS, GA_WANT_TO_UPLOAD_DOCUMENTS,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {Claim} from 'models/claim';
import {selectedApplicationType} from 'models/generalApplication/applicationType';
import {
  getCancelUrl, getLast,
} from 'services/features/generalApplication/generalApplicationService';
import {getClaimById} from 'modules/utilityService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import multer from 'multer';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {
  getSummaryList,
  removeSelectedDocument, uploadSelectedFile,
} from 'services/features/generalApplication/uploadEvidenceDocumentService';
import {summarySection, SummarySection} from 'models/summaryList/summarySections';

const uploadEvidenceDocumentsForApplicationController = Router();
const viewPath = 'features/generalApplication/upload_documents';
const fileSize = Infinity;
const upload = multer({
  limits: {
    fileSize: fileSize,
  },
});

async function renderView(form: GenericForm<UploadGAFiles>, claim: Claim, claimId: string, res: Response, formattedSummary: SummarySection): Promise<void> {
  const applicationType = selectedApplicationType[getLast(claim.generalApplication?.applicationTypes)?.option];
  const cancelUrl = await getCancelUrl(claimId, claim);
  const currentUrl = constructResponseUrlWithIdParams(claimId, GA_UPLOAD_DOCUMENTS);
  const backLinkUrl = constructResponseUrlWithIdParams(claimId, GA_WANT_TO_UPLOAD_DOCUMENTS);
  res.render(viewPath, {
    form,
    formattedSummary,
    cancelUrl,
    backLinkUrl,
    applicationType,
    currentUrl,
  });
}

uploadEvidenceDocumentsForApplicationController.get(GA_UPLOAD_DOCUMENTS, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const redisKey = generateRedisKey(req);
    const uploadDocuments = new UploadGAFiles();
    let form = new GenericForm(uploadDocuments);
    const formattedSummary = summarySection(
      {
        title: '',
        summaryRows: [],
      });
    if (req?.session?.fileUpload) {
      const parsedData = JSON.parse(req?.session?.fileUpload);
      form = new GenericForm(uploadDocuments, parsedData);
      req.session.fileUpload = undefined;
    }
    if (req.query?.id) {
      const index = req.query.id;
      await removeSelectedDocument(redisKey, Number(index)-1);
    }
    await getSummaryList(formattedSummary, redisKey, claimId);
    await renderView(form, claim, claimId, res, formattedSummary);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

uploadEvidenceDocumentsForApplicationController.post(GA_UPLOAD_DOCUMENTS, upload.single('selectedFile'), (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const redisKey = generateRedisKey(req);
    const claim: Claim = await getCaseDataFromStore(redisKey);
    const currentUrl = constructResponseUrlWithIdParams(claimId, GA_UPLOAD_DOCUMENTS);

    const formattedSummary = summarySection(
      {
        title: '',
        summaryRows: [],
      });

    if (req.body.action === 'uploadButton') {
      await uploadSelectedFile(req, formattedSummary, claimId);
      return res.redirect(`${currentUrl}`);
    }
    const uploadDoc = new UploadGAFiles();
    const form = new GenericForm(uploadDoc);
    form.validateSync();
    if (form.hasFieldError('fileUpload') && claim.generalApplication.uploadEvidenceForApplication.length === 0) {
      await getSummaryList(formattedSummary, redisKey, claimId);
      return await renderView(form, claim, claimId, res, formattedSummary);
    } else {
      res.redirect(constructResponseUrlWithIdParams(claimId, GA_HEARING_ARRANGEMENTS_GUIDANCE));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default uploadEvidenceDocumentsForApplicationController;
