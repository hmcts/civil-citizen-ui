import { NextFunction, RequestHandler, Response, Router } from 'express';
import {
  GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_CYA_URL,
  GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_SUBMITTED_URL,
  GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_URL,
} from 'routes/urls';
import { AppRequest } from 'models/AppRequest';
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

const gaWrittenRepresentationCheckAnswersController = Router();
const viewPath = 'features/generalApplication/additionalInfoUpload/checkYourAnswer';
const generalAppApiBaseUrl = config.get<string>('services.generalApplication.url');
const gaServiceClient: GaServiceClient = new GaServiceClient(generalAppApiBaseUrl);
const headerCaption = 'PAGES.GENERAL_APPLICATION.UPLOAD_WRITTEN_REPRESENTATION_DOCUMENTS.PAGE_TITLE';
gaWrittenRepresentationCheckAnswersController.get(GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_CYA_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const { appId, id: claimId } = req.params;
    const claimIdPrettified = caseNumberPrettify(claimId);
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await getClaimById(claimId, req, true);
    const cancelUrl = await getCancelUrl(claimId, claim);
    const additionalDocuments = await getGADocumentsFromDraftStore(generateRedisKeyForGA(req));
    const backLinkUrl = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_URL);
    const summaryRows = buildSummarySection(additionalDocuments, backLinkUrl, lng);
    res.render(viewPath, { backLinkUrl, cancelUrl, claimIdPrettified, claim, summaryRows, headerCaption });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

gaWrittenRepresentationCheckAnswersController.post(GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_CYA_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const { appId, id: claimId } = req.params;
    const uploadedDocumentList = await getGADocumentsFromDraftStore(generateRedisKeyForGA(req));
    const uploadedDocument = translateCUItoCCD(uploadedDocumentList);
    const generalApplication = {
      generalAppWrittenRepUpload: uploadedDocument,
    };
    await gaServiceClient.submitEvent(ApplicationEvent.RESPOND_TO_JUDGE_WRITTEN_REPRESENTATION, appId, generalApplication, req);
    res.redirect(constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_SUBMITTED_URL));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default gaWrittenRepresentationCheckAnswersController;
