import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  GA_UPLOAD_DOCUMENT_FOR_REQUEST_MORE_INFO_CONFIRMATION_URL,
  GA_UPLOAD_DOCUMENT_FOR_REQUEST_MORE_INFO_CYA_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {
  getCancelUrl, getClaimDetailsById,
} from 'services/features/generalApplication/generalApplicationService';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {
  buildSummarySection,
  translateCUItoCCD,
} from 'services/features/generalApplication/additionalInfoUpload/uploadDocumentsForReqMoreInfoService';
import {ApplicationEvent} from 'models/gaEvents/applicationEvent';
import {GaServiceClient} from 'client/gaServiceClient';
import config from 'config';

const gaRequestMoreInfoCheckAnswersController = Router();
const viewPath = 'features/generalApplication/additionalInfoUpload/checkYourAnswer';
const generalAppApiBaseUrl = config.get<string>('services.generalApplication.url');
const gaServiceClient: GaServiceClient = new GaServiceClient(generalAppApiBaseUrl);

gaRequestMoreInfoCheckAnswersController.get(GA_UPLOAD_DOCUMENT_FOR_REQUEST_MORE_INFO_CYA_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const { appId, id: claimId } = req.params;
    const claimIdPrettified = caseNumberPrettify(claimId);
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await getClaimDetailsById(req);
    const cancelUrl = await getCancelUrl(claimId, claim);
    const backLinkUrl = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_DOCUMENT_FOR_REQUEST_MORE_INFO_CYA_URL);
    const summaryRows = buildSummarySection(claim.generalApplication.generalAppAddlnInfoUpload, claimId, appId, lng);
    res.render(viewPath, { backLinkUrl, cancelUrl, claimIdPrettified, claim, summaryRows });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

gaRequestMoreInfoCheckAnswersController.post(GA_UPLOAD_DOCUMENT_FOR_REQUEST_MORE_INFO_CYA_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const { appId, id: claimId } = req.params;
    const claim = await getClaimDetailsById(req);
    const uploadedDocuments = translateCUItoCCD(claim?.generalApplication?.generalAppAddlnInfoUpload);
    const generalApplication = {
      generalAppAddlnInfoUpload: uploadedDocuments,
    };
    await gaServiceClient.submitEvent(ApplicationEvent.RESPOND_TO_JUDGE_ADDITIONAL_INFO, appId, generalApplication , req);
    res.redirect(constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_DOCUMENT_FOR_REQUEST_MORE_INFO_CONFIRMATION_URL));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default  gaRequestMoreInfoCheckAnswersController;
