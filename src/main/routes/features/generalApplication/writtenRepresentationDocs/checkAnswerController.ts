import { NextFunction, RequestHandler, Response, Router } from 'express';
import {
  BACK_URL,
  GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_CYA_URL,
  GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_SUBMITTED_URL,
} from 'routes/urls';
import { AppRequest } from 'models/AppRequest';
import { Claim } from 'models/claim';
import {
  getCancelUrl,
} from 'services/features/generalApplication/generalApplicationService';
import { caseNumberPrettify } from 'common/utils/stringUtils';
import { constructResponseUrlWithIdAndAppIdParams } from 'common/utils/urlFormatter';
import { ApplicationEvent } from 'models/gaEvents/applicationEvent';
import { GaServiceClient } from 'client/gaServiceClient';
import config from 'config';
import { getGADocumentsFromDraftStore } from 'modules/draft-store/draftGADocumentService';
import { generateRedisKeyForGA } from 'modules/draft-store/draftStoreService';
import { getClaimById } from 'modules/utilityService';
import { translateCUItoCCD } from 'services/features/generalApplication/documentUpload/uploadDocumentsService';
import { buildSummarySection } from 'services/features/generalApplication/writtenRepresentation/writtenRepresentationDocsService';
import {
  getDraftGARespondentResponse,
} from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {
  CallbackErrorViewData,
  handleCallbackValidationErrorOrNext,
} from 'client/common/error/handleCallbackValidationError';

const gaWrittenRepresentationCheckAnswersController = Router();
const viewPath = 'features/generalApplication/additionalInfoUpload/checkYourAnswer';
const generalAppApiBaseUrl = config.get<string>('services.generalApplication.url');
const gaServiceClient: GaServiceClient = new GaServiceClient(generalAppApiBaseUrl);
const headerCaption = 'PAGES.GENERAL_APPLICATION.UPLOAD_WRITTEN_REPRESENTATION_DOCUMENTS.PAGE_TITLE';

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
  const additionalDocuments = await getGADocumentsFromDraftStore(generateRedisKeyForGA(req));
  const gaResponse = await getDraftGARespondentResponse(generateRedisKeyForGA(req));
  const additionalText = gaResponse.writtenRepText;
  const backLinkUrl = BACK_URL;
  const summaryRows = buildSummarySection(additionalText, additionalDocuments, claimId, appId, lng);
  res.render(viewPath, {
    backLinkUrl,
    cancelUrl,
    claimIdPrettified,
    claim,
    summaryRows,
    headerCaption,
    callbackErrors: callbackErrorViewData?.callbackErrors,
    callbackWarnings: callbackErrorViewData?.callbackWarnings,
  });
}

gaWrittenRepresentationCheckAnswersController.get(GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_CYA_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const appId = getRouteParam(req, 'appId');
    const claimId = getRouteParam(req, 'id');
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await getClaimById(claimId, req, true);
    await renderView(req, res, claimId, appId, claim, lng);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

gaWrittenRepresentationCheckAnswersController.post(GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_CYA_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  const appId = getRouteParam(req, 'appId');
  const claimId = getRouteParam(req, 'id');
  const lng = req.query.lang ? req.query.lang : req.cookies.lang;
  let claim: Claim;
  try {
    const uploadedDocumentList = await getGADocumentsFromDraftStore(generateRedisKeyForGA(req));
    const uploadedDocument = translateCUItoCCD(uploadedDocumentList);
    const gaResponse = await getDraftGARespondentResponse(generateRedisKeyForGA(req));
    const writtenRepText = gaResponse.writtenRepText;
    const generalApplication = {
      generalAppWrittenRepUpload: uploadedDocument,
      generalAppWrittenRepText: writtenRepText,
    };
    await gaServiceClient.submitEvent(ApplicationEvent.RESPOND_TO_JUDGE_WRITTEN_REPRESENTATION, appId, generalApplication, req);
    res.redirect(constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_SUBMITTED_URL));
  } catch (error) {
    await handleCallbackValidationErrorOrNext(error, res, next, async (viewData) => {
      if (!claim) {
        claim = await getClaimById(claimId, req, true);
      }
      await renderView(req, res, claimId, appId, claim, lng, viewData);
    });
  }
}) as RequestHandler);

export default gaWrittenRepresentationCheckAnswersController;
