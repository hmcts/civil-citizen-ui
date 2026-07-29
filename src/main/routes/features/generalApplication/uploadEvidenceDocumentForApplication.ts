import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  GA_HEARING_ARRANGEMENTS_GUIDANCE_URL,
  GA_UPLOAD_DOCUMENTS_URL, GA_UPLOAD_DOCUMENTS_COSC_URL, GA_CHECK_YOUR_ANSWERS_COSC_URL,
  GA_UPLOAD_DOCUMENTS_AJAX_UPLOAD_URL,
  GA_UPLOAD_DOCUMENTS_AJAX_DELETE_URL,
  BACK_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {Claim} from 'models/claim';
import {
  getCancelUrl,
  getDynamicHeaderForMultipleApplications,
  isConfirmYouPaidCCJAppType,
} from 'services/features/generalApplication/generalApplicationService';
import {getClaimById} from 'modules/utilityService';
import {constructResponseUrlWithIdParams, constructUrlWithIndex} from 'common/utils/urlFormatter';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {
  getSummaryList,
  removeSelectedDocument,
  removeSelectedDocumentByName,
  uploadSelectedFile,
  uploadSelectedFileForAjax,
} from 'services/features/generalApplication/uploadEvidenceDocumentService';
import {summarySection, SummarySection} from 'models/summaryList/summarySections';
import {queryParamNumber} from 'common/utils/requestUtils';
import {
  createMulterErrorMiddlewareForSingleField,
  createUploadOneFileError,
  getFileUploadErrorsForSource,
  FILE_UPLOAD_SOURCE,
} from 'common/utils/fileUploadUtils';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {handleMulterError} from 'services/features/generalApplication/uploadEvidenceDocumentService';
import {t} from 'i18next';

const uploadEvidenceDocumentsForApplicationController = Router();
const viewPath = 'features/generalApplication/upload_documents';
const multerMiddleware = createMulterErrorMiddlewareForSingleField('documents', 'uploadEvidenceDocumentsForApplicationController');
const multerAjaxMiddleware = createMulterErrorMiddlewareForSingleField('documents', 'uploadEvidenceDocumentsForApplicationAjax');

async function renderView(form: GenericForm<UploadGAFiles>, claim: Claim, claimId: string, res: Response, formattedSummary: SummarySection, index: number): Promise<void> {
  const cancelUrl = await getCancelUrl(claimId, claim);
  const isConfirmPaidCCJAppType = isConfirmYouPaidCCJAppType(claim);
  const currentPage = isConfirmPaidCCJAppType ? GA_UPLOAD_DOCUMENTS_COSC_URL : GA_UPLOAD_DOCUMENTS_URL;
  const currentUrl = constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, currentPage), index);
  const backLinkUrl = BACK_URL;
  const headerTitle = isConfirmPaidCCJAppType ? 'COMMON.ASK_FOR_PROOF_OF_DEBT_PAYMENT' : getDynamicHeaderForMultipleApplications(claim);
  const csrf = res.locals.csrf;
  const ajaxUploadUrl = `${constructResponseUrlWithIdParams(claimId, GA_UPLOAD_DOCUMENTS_AJAX_UPLOAD_URL)}?_csrf=${csrf}`;
  const ajaxDeleteUrl = `${constructResponseUrlWithIdParams(claimId, GA_UPLOAD_DOCUMENTS_AJAX_DELETE_URL)}?_csrf=${csrf}`;
  const uploadedFiles = formattedSummary.summaryList.rows.map((row) => ({
    fileName: row.key.text,
    originalFileName: row.key.text,
    message: { text: row.key.text },
    deleteButton: { text: t('PAGES.GENERAL_APPLICATION.UPLOAD_DOCUMENTS.REMOVE_DOC') },
  }));
  res.render(viewPath, {
    form,
    formattedSummary,
    uploadedFiles,
    cancelUrl,
    backLinkUrl,
    headerTitle,
    currentUrl,
    ajaxUploadUrl,
    ajaxDeleteUrl,
  });
}

uploadEvidenceDocumentsForApplicationController.get([GA_UPLOAD_DOCUMENTS_URL, GA_UPLOAD_DOCUMENTS_COSC_URL], (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    const index  = queryParamNumber(req, 'index');
    const claim = await getClaimById(claimId, req, true);
    const redisKey = generateRedisKey(req);
    const uploadDocuments = new UploadGAFiles();
    let form = new GenericForm(uploadDocuments);
    const formattedSummary = summarySection(
      {
        title: '',
        summaryRows: [],
      });
    const fileUploadErrors = getFileUploadErrorsForSource(req, FILE_UPLOAD_SOURCE.GA_UPLOAD_EVIDENCE);
    if (fileUploadErrors?.length) {
      form = new GenericForm(uploadDocuments, fileUploadErrors);
    }
    if (req.query?.id) {
      await removeSelectedDocument(redisKey, Number(req.query.id) - 1);
      const currentPage = isConfirmYouPaidCCJAppType(claim) ? GA_UPLOAD_DOCUMENTS_COSC_URL : GA_UPLOAD_DOCUMENTS_URL;
      const baseUrl = constructResponseUrlWithIdParams(claimId, currentPage);
      const redirectUrl = req.query?.lang ? `${baseUrl}?lang=${req.query.lang}` : baseUrl;
      return res.redirect(redirectUrl);
    }
    await getSummaryList(formattedSummary, redisKey, claimId);
    await renderView(form, claim, claimId, res, formattedSummary, index);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

uploadEvidenceDocumentsForApplicationController.post(GA_UPLOAD_DOCUMENTS_AJAX_UPLOAD_URL, multerAjaxMiddleware, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    if ((req as any).multerError) {
      const constraint = (req as any).multerError?.code === 'LIMIT_FILE_SIZE'
        ? t('ERRORS.VALID_SIZE_FILE')
        : t('ERRORS.FILE_UPLOAD_FAILED');
      return res.status(400).json({ error: { message: constraint } });
    }
    const result = await uploadSelectedFileForAjax(req);
    if (result.error) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

uploadEvidenceDocumentsForApplicationController.post(GA_UPLOAD_DOCUMENTS_AJAX_DELETE_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(req);
    const documentName = req.body?.delete;
    if (!documentName) {
      return res.status(400).json({ error: { message: 'Missing file name' } });
    }
    const removed = await removeSelectedDocumentByName(redisKey, documentName);
    if (!removed) {
      return res.status(404).json({ error: { message: 'File not found' } });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

uploadEvidenceDocumentsForApplicationController.post([GA_UPLOAD_DOCUMENTS_URL, GA_UPLOAD_DOCUMENTS_COSC_URL], multerMiddleware, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    const index  = queryParamNumber(req, 'index');
    const redisKey = generateRedisKey(req);
    const claim: Claim = await getCaseDataFromStore(redisKey);
    const isConfirmPaidCCJAppType = isConfirmYouPaidCCJAppType(claim);
    const currentPage = isConfirmPaidCCJAppType ? GA_UPLOAD_DOCUMENTS_COSC_URL : GA_UPLOAD_DOCUMENTS_URL;
    const currentUrl = constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, currentPage), index);
    const nextPageUrl = isConfirmPaidCCJAppType ? GA_CHECK_YOUR_ANSWERS_COSC_URL : GA_HEARING_ARRANGEMENTS_GUIDANCE_URL;

    const formattedSummary = summarySection(
      {
        title: '',
        summaryRows: [],
      });

    if (req.body?.delete) {
      await removeSelectedDocumentByName(redisKey, req.body.delete);
      return res.redirect(`${currentUrl}`);
    }

    if (handleMulterError(req)) {
      return req.session.save(() => {
        res.redirect(`${currentUrl}`);
      });
    }

    if (req.body.action === 'uploadButton') {
      await uploadSelectedFile(req, formattedSummary, claimId);
      return req.session.save(() => {
        res.redirect(`${currentUrl}`);
      });
    }
    const uploadDoc = new UploadGAFiles();
    const form = new GenericForm(uploadDoc);
    form.validateSync();
    if (form.hasFieldError('fileUpload') && claim.generalApplication.uploadEvidenceForApplication.length === 0) {
      req.session.fileUpload = JSON.stringify(createUploadOneFileError());
      req.session.fileUploadSource = FILE_UPLOAD_SOURCE.GA_UPLOAD_EVIDENCE;
      return req.session.save(() => {
        res.redirect(`${currentUrl}`);
      });
    } else {
      res.redirect(constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, nextPageUrl), index));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default uploadEvidenceDocumentsForApplicationController;
