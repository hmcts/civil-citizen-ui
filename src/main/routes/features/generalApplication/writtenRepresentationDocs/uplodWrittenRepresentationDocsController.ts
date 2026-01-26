import { NextFunction, RequestHandler, Response, Router } from 'express';
import {
  BACK_URL,
  GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_CYA_URL,
  GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_URL,
} from 'routes/urls';
import { AppRequest } from 'models/AppRequest';
import { GenericForm } from 'form/models/genericForm';
import { Claim } from 'models/claim';
import { getCancelUrl } from 'services/features/generalApplication/generalApplicationService';
import { getClaimById } from 'modules/utilityService';
import { constructResponseUrlWithIdAndAppIdParams } from 'common/utils/urlFormatter';
import { generateRedisKeyForGA } from 'modules/draft-store/draftStoreService';
import { UploadGAFiles } from 'models/generalApplication/uploadGAFiles';
import { summarySection, SummarySection } from 'models/summaryList/summarySections';
import { getGADocumentsFromDraftStore } from 'modules/draft-store/draftGADocumentService';
import {
  removeSelectedDocument,
  uploadSelectedFile,
} from 'services/features/generalApplication/documentUpload/uploadDocumentsService';
import { getSummaryList } from 'services/features/generalApplication/writtenRepresentation/writtenRepresentationDocsService';
import {
  createMulterErrorMiddleware,
  handleMulterError,
  createUploadOneFileError,
} from 'common/utils/fileUploadUtils';

const uploadDocumentsForRequestWrittenRepresentation = Router();
const viewPath = 'features/generalApplication/additionalInfoUpload/upload-documents';
const multerMiddleware = createMulterErrorMiddleware('uploadDocumentsForRequestWrittenRepresentation');

async function renderView(form: GenericForm<UploadGAFiles>, claim: Claim, claimId: string, gaId: string, res: Response, formattedSummary: SummarySection): Promise<void> {
  const cancelUrl = await getCancelUrl(claimId, claim);
  const currentUrl = constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_URL);
  const backLinkUrl = BACK_URL;
  res.render(viewPath, {
    form,
    formattedSummary,
    cancelUrl,
    backLinkUrl,
    headerTitle: 'PAGES.GENERAL_APPLICATION.UPLOAD_MORE_INFO_DOCUMENTS.PAGE_TITLE_TO_UPLOAD',
    currentUrl,
  });
}

uploadDocumentsForRequestWrittenRepresentation.get(GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const { appId, id: claimId } =
      req.params;
    const claim = await getClaimById(claimId, req, true);
    const redisKey = generateRedisKeyForGA(req);
    const uploadDocuments = new UploadGAFiles();
    let form = new GenericForm(uploadDocuments);
    const formattedSummary = summarySection({ title: '', summaryRows: [] });
    if (req?.session?.fileUpload) {
      const parsedData = JSON.parse(req?.session?.fileUpload);
      form = new GenericForm(uploadDocuments, parsedData);
      req.session.fileUpload = undefined;
    }
    if (req.query?.id) {
      const index = req.query.id;
      await removeSelectedDocument(redisKey, Number(index) - 1);
    }
    await getSummaryList(formattedSummary, redisKey, constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_URL));
    await renderView(form, claim, claimId, appId, res, formattedSummary);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

uploadDocumentsForRequestWrittenRepresentation.post(GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_URL, multerMiddleware, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const { appId, id: claimId } = req.params;
    const uploadedDocuments = await getGADocumentsFromDraftStore(generateRedisKeyForGA(req));
    const currentUrl = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_URL);

    if (req.body.action === 'uploadButton') {
      const multerErrors = handleMulterError(req);
      if (multerErrors) {
        return res.redirect(`${currentUrl}`);
      }
    }

    if (req.body.action === 'uploadButton') {
      await uploadSelectedFile(req);
      return res.redirect(`${currentUrl}`);
    }
    const uploadDoc = new UploadGAFiles();
    const form = new GenericForm(uploadDoc);
    form.validateSync();
    if (form.hasFieldError('fileUpload') && uploadedDocuments?.length === 0) {
      req.session.fileUpload = JSON.stringify(createUploadOneFileError());
      return res.redirect(`${currentUrl}`);
    } else {
      res.redirect(constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_CYA_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default uploadDocumentsForRequestWrittenRepresentation;
