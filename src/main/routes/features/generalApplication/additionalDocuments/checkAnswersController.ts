import { ApplicationEvent } from 'common/models/gaEvents/applicationEvent';
import { AppRequest } from 'common/models/AppRequest';
import { Claim } from 'common/models/claim';
import { buildSummarySectionForAdditionalDoc, getClaimDetailsById, prepareCCDData } from 'services/features/generalApplication/additionalDocumentService';
import { caseNumberPrettify } from 'common/utils/stringUtils';
import {
  BACK_URL,
  GA_UPLOAD_ADDITIONAL_DOCUMENTS_CYA_URL,
  GA_UPLOAD_ADDITIONAL_DOCUMENTS_SUBMITTED_URL,
} from 'routes/urls';
import { GaServiceClient } from 'client/gaServiceClient';
import { getCancelUrl } from 'services/features/generalApplication/generalApplicationService';
import { NextFunction, RequestHandler, Response, Router } from 'express';
import config from 'config';
import { constructResponseUrlWithIdAndAppIdParams } from 'common/utils/urlFormatter';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {
  CallbackErrorViewData,
  callbackErrorRenderProps,
  handleCallbackValidationErrorOrNext,
} from 'client/common/error/handleCallbackValidationError';

const gaAdditionalDocCheckAnswerController = Router();
const viewPath = 'features/generalApplication/additionalDocuments/check-answers';
const generalAppApiBaseUrl = config.get<string>('services.generalApplication.url');
const gaServiceClient: GaServiceClient = new GaServiceClient(generalAppApiBaseUrl);

async function renderView(
  req: AppRequest,
  res: Response,
  claimId: string,
  appId: string,
  claim: Claim,
  lng: string,
  callbackErrorViewData?: CallbackErrorViewData,
): Promise<void> {
  const claimIdPrettified = caseNumberPrettify(claimId);
  const cancelUrl = await getCancelUrl(claimId, claim);
  const backLinkUrl = BACK_URL;
  const summaryRows = buildSummarySectionForAdditionalDoc(claim.generalApplication.uploadAdditionalDocuments, claimId, appId, lng);
  res.render(viewPath, {
    backLinkUrl,
    cancelUrl,
    claimIdPrettified,
    claim,
    summaryRows,
    ...callbackErrorRenderProps(callbackErrorViewData),
  });
}

gaAdditionalDocCheckAnswerController.get(GA_UPLOAD_ADDITIONAL_DOCUMENTS_CYA_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const appId = getRouteParam(req, 'appId');
    const claimId = getRouteParam(req, 'id');
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await getClaimDetailsById(req);
    await renderView(req, res, claimId, appId, claim, lng);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

gaAdditionalDocCheckAnswerController.post(GA_UPLOAD_ADDITIONAL_DOCUMENTS_CYA_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  const appId = getRouteParam(req, 'appId');
  const claimId = getRouteParam(req, 'id');
  const lng = req.query.lang ? req.query.lang : req.cookies.lang;
  let claim: Claim;
  try {
    claim = await getClaimDetailsById(req);
    const uploadedDocuments = prepareCCDData(claim.generalApplication.uploadAdditionalDocuments);
    const generalApplication = {
      uploadDocument: uploadedDocuments,
    };
    await gaServiceClient.submitEvent(ApplicationEvent.UPLOAD_ADDL_DOCUMENTS, appId, generalApplication as unknown, req);
    res.redirect(constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_SUBMITTED_URL));
  } catch (error) {
    await handleCallbackValidationErrorOrNext(error, res, next, (viewData) =>
      renderView(req, res, claimId, appId, claim, lng, viewData));
  }
}) as RequestHandler);

export default gaAdditionalDocCheckAnswerController;
