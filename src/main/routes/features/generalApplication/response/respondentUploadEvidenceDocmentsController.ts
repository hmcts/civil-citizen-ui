import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  BACK_URL,
  GA_RESPONDENT_HEARING_PREFERENCE_URL,
  GA_RESPONDENT_UPLOAD_DOCUMENT_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {Claim} from 'models/claim';
import {getCancelUrl} from 'services/features/generalApplication/generalApplicationService';
import {getClaimById} from 'modules/utilityService';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import multer from 'multer';
import {generateRedisKeyForGA} from 'modules/draft-store/draftStoreService';
import {
  getSummaryList,
  removeDocumentFromRedis,
  uploadSelectedFile,
} from 'services/features/generalApplication/response/respondentUploadEvidenceDocumentsService';
import {summarySection, SummarySection} from 'models/summaryList/summarySections';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {
  getRespondToApplicationCaption,
} from 'services/features/generalApplication/response/generalApplicationResponseService';
import {
  getDraftGARespondentResponse,
} from 'services/features/generalApplication/response/generalApplicationResponseStoreService';

const respondentUploadEvidenceDocumentsController = Router();
const viewPath = 'features/generalApplication/response/respondent-upload-documents';
const upload = multer({
  limits: {
    fileSize: Infinity,
  },
});

async function renderView(req: AppRequest, form: GenericForm<UploadGAFiles>, claim: Claim, claimId: string, res: Response, appId: string, formattedSummary: SummarySection): Promise<void> {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const gaResponse = await getDraftGARespondentResponse(generateRedisKeyForGA(<AppRequest>req));
  const applicationType: string = getRespondToApplicationCaption(gaResponse.generalApplicationType, lang);
  const cancelUrl = await getCancelUrl(claimId, claim);
  const currentUrl = constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_RESPONDENT_UPLOAD_DOCUMENT_URL);
  const backLinkUrl = BACK_URL;
  res.render(viewPath, {
    form,
    formattedSummary,
    cancelUrl,
    backLinkUrl,
    applicationType,
    currentUrl,
  });
}

respondentUploadEvidenceDocumentsController.get(GA_RESPONDENT_UPLOAD_DOCUMENT_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const redisKeyForGA = generateRedisKeyForGA(req);
    const uploadEvidenceDocuments = new UploadGAFiles();
    let form = new GenericForm(uploadEvidenceDocuments);
    const formattedSummary = summarySection(
      {
        title: '',
        summaryRows: [],
      });
    if (req?.session?.fileUpload) {
      form = parseFileUploadToForm(req, uploadEvidenceDocuments);
    }
    if (req.query?.id) {
      const index = req.query.id;
      await removeDocumentFromRedis(redisKeyForGA, Number(index) - 1);
    }
    await getSummaryList(formattedSummary, redisKeyForGA, claimId, req.params.appId);
    await renderView(req, form, claim, claimId, res, req.params.appId, formattedSummary);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

respondentUploadEvidenceDocumentsController.post(GA_RESPONDENT_UPLOAD_DOCUMENT_URL, upload.single('selectedFile'), (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const redisKeyForGA = generateRedisKeyForGA(req);
    const gaResponse = await getDraftGARespondentResponse(redisKeyForGA);
    const currentUrl = constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_RESPONDENT_UPLOAD_DOCUMENT_URL);

    const formattedSummary = summarySection(
      {
        title: '',
        summaryRows: [],
      });

    if (req.body.action === 'uploadButton') {
      await uploadSelectedFile(req, formattedSummary, claimId, req.params.appId);
      return res.redirect(`${currentUrl}`);
    }

    const uploadGaDoc = new UploadGAFiles();
    const form = new GenericForm(uploadGaDoc);
    form.validateSync();
    if (form.hasFieldError('fileUpload') && (gaResponse?.uploadEvidenceDocuments === undefined ||
      gaResponse?.uploadEvidenceDocuments?.length === 0)) {
      const errors = [{
        target: {
          fileUpload: '',
          typeOfDocument: '',
        },
        value: '',
        property: '',
        constraints: {
          isNotEmpty: 'ERRORS.GENERAL_APPLICATION.UPLOAD_ONE_FILE',
        },
      }];
      req.session.fileUpload = JSON.stringify(errors);
      return res.redirect(`${currentUrl}`);
    } else {
      res.redirect(constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_RESPONDENT_HEARING_PREFERENCE_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

function parseFileUploadToForm (req : AppRequest, uploadEvidenceDocuments: UploadGAFiles) : GenericForm<UploadGAFiles>{
  const parsedData = JSON.parse(req?.session?.fileUpload);
  req.session.fileUpload = undefined;
  return new GenericForm(uploadEvidenceDocuments, parsedData);
}
export default respondentUploadEvidenceDocumentsController;
