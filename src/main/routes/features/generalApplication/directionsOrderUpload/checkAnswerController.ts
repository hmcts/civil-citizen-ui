import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  BACK_URL,
  GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_CONFIRMATION_URL,
  GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_CYA_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {getCancelUrl} from 'services/features/generalApplication/generalApplicationService';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {buildSummarySection} from 'services/features/generalApplication/directionsOrderUpload/uploadDocumentsDirectionsOrderService';
import {ApplicationEvent} from 'models/gaEvents/applicationEvent';
import {GaServiceClient} from 'client/gaServiceClient';
import config from 'config';
import {getGADocumentsFromDraftStore} from 'modules/draft-store/draftGADocumentService';
import {generateRedisKeyForGA} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {translateCUItoCCD} from 'services/features/generalApplication/documentUpload/uploadDocumentsService';

const gaDirectionOrderCheckAnswersController = Router();
const viewPath = 'features/generalApplication/directionsOrderUpload/check-answers';
const generalAppApiBaseUrl = config.get<string>('services.generalApplication.url');
const gaServiceClient: GaServiceClient = new GaServiceClient(generalAppApiBaseUrl);

gaDirectionOrderCheckAnswersController.get(GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_CYA_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const { appId, id: claimId } = req.params;
    const claimIdPrettified = caseNumberPrettify(claimId);
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await getClaimById(claimId, req, true);
    const cancelUrl = await getCancelUrl(claimId, claim);
    const additionalDocuments = await getGADocumentsFromDraftStore(generateRedisKeyForGA(req));
    const backLinkUrl = BACK_URL;
    const summaryRows = buildSummarySection(additionalDocuments, claimId, appId, lng);
    res.render(viewPath, { backLinkUrl, cancelUrl, claimIdPrettified, claim, summaryRows });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

gaDirectionOrderCheckAnswersController.post(GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_CYA_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const { appId, id: claimId } = req.params;
    const uploadedDocumentList = await getGADocumentsFromDraftStore(generateRedisKeyForGA(req));
    const uploadedDocument = translateCUItoCCD(uploadedDocumentList);
    const generalApplication = {
      generalAppDirOrderUpload: uploadedDocument,
    };
    await gaServiceClient.submitEvent(ApplicationEvent.RESPOND_TO_JUDGE_DIRECTIONS, appId, generalApplication, req);
    res.redirect(constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_CONFIRMATION_URL));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default  gaDirectionOrderCheckAnswersController;
