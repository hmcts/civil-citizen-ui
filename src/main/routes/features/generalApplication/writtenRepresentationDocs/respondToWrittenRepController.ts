import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  BACK_URL,
  GA_MAKE_WITH_NOTICE_DOCUMENT_VIEW_URL,
  GA_PROVIDE_MORE_INFORMATION_URL,
  GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_CYA_URL,
  GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {caseNumberPrettify, documentIdExtractor} from 'common/utils/stringUtils';
import {getClaimById} from 'modules/utilityService';
import {
  getApplicationFromGAService,
  getCancelUrl, saveWrittenRepText,
} from 'services/features/generalApplication/generalApplicationService';
import {
  constructDocumentUrlWithIdParamsAndDocumentId,
  constructResponseUrlWithIdAndAppIdParams,
} from 'common/utils/urlFormatter';
import {GenericForm} from 'form/models/genericForm';
import {RespondAddInfo} from 'models/generalApplication/response/respondAddInfo';
import {generateRedisKeyForGA} from 'modules/draft-store/draftStoreService';
import {
  getDraftGARespondentResponse,
} from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {YesNo} from 'form/models/yesNo';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {DocumentType} from 'models/document/documentType';

const respondWrittenRepController = Router();
const viewPath = 'features/generalApplication/additionalInfoUpload/respondToWrittenRepInfo';
const headerCaption = 'PAGES.GENERAL_APPLICATION.RESPONDENT_UPLOAD_OPTION.TITLE';

respondWrittenRepController.get(GA_PROVIDE_MORE_INFORMATION_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const { appId, id: claimId } = req.params;
    const currentUrl = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_PROVIDE_MORE_INFORMATION_URL);
    const claimIdPrettified = caseNumberPrettify(claimId);
    const claim = await getClaimById(claimId, req, true);
    const gaResponse = await getDraftGARespondentResponse(generateRedisKeyForGA(req));
    const cancelUrl = await getCancelUrl(claimId, claim);
    const backLinkUrl = BACK_URL;
    const writtenRepText = gaResponse.writtenRepText;
    const wantToUploadAddlDocuments = gaResponse.wantToUploadAddlDocuments;
    const respondWrittenRep = new RespondAddInfo(wantToUploadAddlDocuments, writtenRepText);
    const form = new GenericForm(respondWrittenRep);
    const applicationResponse: ApplicationResponse = await getApplicationFromGAService(req, appId);
    const docUrl = getRedirectUrl(appId, applicationResponse);
    res.render(viewPath, { currentUrl, backLinkUrl, cancelUrl, claimIdPrettified, claim, form, docUrl, headerCaption});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

respondWrittenRepController.post(GA_PROVIDE_MORE_INFORMATION_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const option = req.body.option;
    const text = req.body.writtenRepText;
    const { appId, id:claimId } = req.params;
    const currentUrl = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_PROVIDE_MORE_INFORMATION_URL);
    const respondWrittenRepInfo = new RespondAddInfo(
      option,
      text,
    );
    const form = new GenericForm(respondWrittenRepInfo);
    await form.validate();
    if (form.hasErrors()) {
      const claimIdPrettified = caseNumberPrettify(claimId);
      const claim = await getClaimById(claimId, req, true);
      const cancelUrl = await getCancelUrl(claimId, claim);
      const backLinkUrl = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_PROVIDE_MORE_INFORMATION_URL);
      const applicationResponse: ApplicationResponse = await getApplicationFromGAService(req, appId);
      const docUrl = getRedirectUrl(appId, applicationResponse);
      return res.render(viewPath, { currentUrl, backLinkUrl, cancelUrl, claimIdPrettified, claim, form, docUrl, headerCaption});
    }
    await saveWrittenRepText(generateRedisKeyForGA(req), text, option);
    let redirectUrl;
    if (option == YesNo.YES) {
      redirectUrl = constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_URL);
    } else if (option == YesNo.NO) {
      redirectUrl = constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_CYA_URL);
    }
    res.redirect(redirectUrl);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

function getRedirectUrl(applicationId: string, applicationResponse: ApplicationResponse): string {
  const writtenRepSequentialDocument = applicationResponse?.case_data?.writtenRepSequentialDocument;
  const writtenRepConcurrentDocument = applicationResponse?.case_data?.writtenRepConcurrentDocument;
  if (writtenRepSequentialDocument) {
    const seqDocId = writtenRepSequentialDocument.find(doc => doc?.value?.documentType === DocumentType.WRITTEN_REPRESENTATION_SEQUENTIAL);
    const seqDocumentId = documentIdExtractor(seqDocId?.value?.documentLink?.document_binary_url);
    return constructDocumentUrlWithIdParamsAndDocumentId(applicationId, seqDocumentId, GA_MAKE_WITH_NOTICE_DOCUMENT_VIEW_URL);
  }
  else if (writtenRepConcurrentDocument) {
    const concurrentDoc = writtenRepConcurrentDocument.find(doc => doc?.value?.documentType === DocumentType.WRITTEN_REPRESENTATION_CONCURRENT);
    const conDocumentId = documentIdExtractor(concurrentDoc?.value?.documentLink?.document_binary_url);
    return constructDocumentUrlWithIdParamsAndDocumentId(applicationId, conDocumentId, GA_MAKE_WITH_NOTICE_DOCUMENT_VIEW_URL);
  }
  return undefined;
}

export default respondWrittenRepController;
