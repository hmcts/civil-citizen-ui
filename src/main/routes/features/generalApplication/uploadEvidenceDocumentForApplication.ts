import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  GA_HEARING_ARRANGEMENTS_GUIDANCE_URL,
  GA_UPLOAD_DOCUMENTS_URL, GA_UPLOAD_DOCUMENTS_COSC_URL, GA_CHECK_YOUR_ANSWERS_COSC_URL,
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
  removeSelectedDocument, uploadSelectedFile,
} from 'services/features/generalApplication/uploadEvidenceDocumentService';
import {summarySection, SummarySection} from 'models/summaryList/summarySections';
import {queryParamNumber} from 'common/utils/requestUtils';
import {createMulterUpload, createUploadOneFileError} from 'common/utils/fileUploadUtils';

const uploadEvidenceDocumentsForApplicationController = Router();
const viewPath = 'features/generalApplication/upload_documents';
const upload = createMulterUpload();

async function renderView(form: GenericForm<UploadGAFiles>, claim: Claim, claimId: string, res: Response, formattedSummary: SummarySection, index: number): Promise<void> {
  const cancelUrl = await getCancelUrl(claimId, claim);
  const isConfirmPaidCCJAppType = isConfirmYouPaidCCJAppType(claim);
  const currentPage = isConfirmPaidCCJAppType ? GA_UPLOAD_DOCUMENTS_COSC_URL : GA_UPLOAD_DOCUMENTS_URL;
  const currentUrl = constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, currentPage), index);
  const backLinkUrl = BACK_URL;
  const headerTitle = isConfirmPaidCCJAppType ? 'COMMON.ASK_FOR_PROOF_OF_DEBT_PAYMENT' : getDynamicHeaderForMultipleApplications(claim);
  res.render(viewPath, {
    form,
    formattedSummary,
    cancelUrl,
    backLinkUrl,
    headerTitle,
    currentUrl,
  });
}

uploadEvidenceDocumentsForApplicationController.get([GA_UPLOAD_DOCUMENTS_URL, GA_UPLOAD_DOCUMENTS_COSC_URL], (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
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
    await renderView(form, claim, claimId, res, formattedSummary, index);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

uploadEvidenceDocumentsForApplicationController.post([GA_UPLOAD_DOCUMENTS_URL, GA_UPLOAD_DOCUMENTS_COSC_URL], upload.single('selectedFile'), (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
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

    if (req.body.action === 'uploadButton') {
      await uploadSelectedFile(req, formattedSummary, claimId);
      return res.redirect(`${currentUrl}`);
    }
    const uploadDoc = new UploadGAFiles();
    const form = new GenericForm(uploadDoc);
    form.validateSync();
    if (form.hasFieldError('fileUpload') && claim.generalApplication.uploadEvidenceForApplication.length === 0) {
      req.session.fileUpload = JSON.stringify(createUploadOneFileError());
      return res.redirect(`${currentUrl}`);
    } else {
      res.redirect(constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, nextPageUrl),index));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default uploadEvidenceDocumentsForApplicationController;
