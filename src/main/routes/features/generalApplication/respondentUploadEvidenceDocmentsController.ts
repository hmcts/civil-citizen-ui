import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  GA_RESPONDENT_HEARING_PREFERENCE,
  GA_RESPONDENT_UPLOAD_DOCUMENT,
  GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {Claim} from 'models/claim';
import {
  getCancelUrl,
  getRespondToApplicationCaption,
} from 'services/features/generalApplication/generalApplicationService';
import {getClaimById} from 'modules/utilityService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import multer from 'multer';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {
  getSummaryList,
  removeDocumentFromRedis,
  uploadSelectedFile,
} from 'services/features/generalApplication/response/respondentUploadEvidenceDocumentsService';
import {summarySection, SummarySection} from 'models/summaryList/summarySections';
import {UploadGAFiles} from 'common/models/generalApplication/UploadGAFiles';

const respondentUploadEvidenceDocumentsController = Router();
const viewPath = 'features/generalApplication/respondent-upload-documents';
const fileSize = Infinity;
const upload = multer({
  limits: {
    fileSize: fileSize,
  },
});

async function renderView(req: AppRequest, form: GenericForm<UploadGAFiles>, claim: Claim, claimId: string, res: Response, formattedSummary: SummarySection): Promise<void> {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const applicationType: string = getRespondToApplicationCaption(claim, lang);
  const cancelUrl = await getCancelUrl(claimId, claim);
  const currentUrl = constructResponseUrlWithIdParams(claimId, GA_RESPONDENT_UPLOAD_DOCUMENT);
  const backLinkUrl = constructResponseUrlWithIdParams(claimId, GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT);
  res.render(viewPath, {
    form,
    formattedSummary,
    cancelUrl,
    backLinkUrl,
    applicationType,
    currentUrl,
  });
}

respondentUploadEvidenceDocumentsController.get(GA_RESPONDENT_UPLOAD_DOCUMENT, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const redisKey = generateRedisKey(req);
    const uploadEvidenceDocuments = new UploadGAFiles();
    let form = new GenericForm(uploadEvidenceDocuments);
    const formattedSummary = summarySection(
      {
        title: '',
        summaryRows: [],
      });
    if (req?.session?.fileUpload) {
      const parsedData = JSON.parse(req?.session?.fileUpload);
      form = new GenericForm(uploadEvidenceDocuments, parsedData);
      req.session.fileUpload = undefined;
    }
    if (req.query?.id) {
      const index = req.query.id;
      await removeDocumentFromRedis(redisKey, Number(index)-1);
    }
    await getSummaryList(formattedSummary, redisKey, claimId);
    await renderView(req, form, claim, claimId, res, formattedSummary);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

respondentUploadEvidenceDocumentsController.post(GA_RESPONDENT_UPLOAD_DOCUMENT, upload.single('selectedFile'), (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const redisKey = generateRedisKey(req);
    const claim: Claim = await getCaseDataFromStore(redisKey);
    const currentUrl = constructResponseUrlWithIdParams(claimId, GA_RESPONDENT_UPLOAD_DOCUMENT);

    const formattedSummary = summarySection(
      {
        title: '',
        summaryRows: [],
      });

    if (req.body.action === 'uploadButton') {
      await uploadSelectedFile(req, formattedSummary, claimId);
      return res.redirect(`${currentUrl}`);
    }

    const uploadGaDoc = new UploadGAFiles();
    const form = new GenericForm(uploadGaDoc);
    form.validateSync();
    if (form.hasFieldError('fileUpload') && claim.generalApplication?.gaResponse?.uploadEvidenceDocuments.length === 0) {
      await getSummaryList(formattedSummary, redisKey, claimId);
      return await renderView(req, form, claim, claimId, res, formattedSummary);
    } else {
      res.redirect(constructResponseUrlWithIdParams(claimId, GA_RESPONDENT_HEARING_PREFERENCE));// TODO: add url
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);
export default respondentUploadEvidenceDocumentsController;
