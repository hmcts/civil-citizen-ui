import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_CONFIRMATION_URL,
  GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_CYA_URL, GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {
  getCancelUrl,
} from 'services/features/generalApplication/generalApplicationService';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {buildSummarySection} from 'services/features/generalApplication/additionalInfoUpload/uploadDocumentsForReqMoreInfoService';
import {ApplicationEvent} from 'models/gaEvents/applicationEvent';
import {GaServiceClient} from 'client/gaServiceClient';
import config from 'config';
import {getGADocumentsFromDraftStore} from 'modules/draft-store/draftGADocumentService';
import {generateRedisKeyForGA} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {translateCUItoCCD} from 'services/features/generalApplication/documentUpload/uploadDocumentsService';

const gaRequestMoreInfoCheckAnswersController = Router();
const viewPath = 'features/generalApplication/additionalInfoUpload/checkYourAnswer';
const generalAppApiBaseUrl = config.get<string>('services.generalApplication.url');
const gaServiceClient: GaServiceClient = new GaServiceClient(generalAppApiBaseUrl);

gaRequestMoreInfoCheckAnswersController.get(GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_CYA_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const { appId, id: claimId } = req.params;
    const claimIdPrettified = caseNumberPrettify(claimId);
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await getClaimById(claimId, req, true);
    const cancelUrl = await getCancelUrl(claimId, claim);
    const additionalDocuments = await getGADocumentsFromDraftStore(generateRedisKeyForGA(req));
    const backLinkUrl = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL);
    const summaryRows = buildSummarySection(additionalDocuments, claimId, appId, lng);
    res.render(viewPath, { backLinkUrl, cancelUrl, claimIdPrettified, claim, summaryRows });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

gaRequestMoreInfoCheckAnswersController.post(GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_CYA_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const { appId, id: claimId } = req.params;
    const uploadedDocumentList = await getGADocumentsFromDraftStore(generateRedisKeyForGA(req));
    const uploadedDocument = translateCUItoCCD(uploadedDocumentList);
    const generalApplication = {
      generalAppAddlnInfoUpload: uploadedDocument,
    };
    await gaServiceClient.submitEvent(ApplicationEvent.RESPOND_TO_JUDGE_ADDITIONAL_INFO, appId, generalApplication , req);
    res.redirect(constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_CONFIRMATION_URL));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default  gaRequestMoreInfoCheckAnswersController;