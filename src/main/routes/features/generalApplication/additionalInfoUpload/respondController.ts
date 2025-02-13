import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  BACK_URL,
  GA_MAKE_WITH_NOTICE_DOCUMENT_VIEW_URL,
  GA_RESPOND_ADDITIONAL_INFO_URL, GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_CYA_URL,
  GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {caseNumberPrettify, documentIdExtractor} from 'common/utils/stringUtils';
import {getClaimById} from 'modules/utilityService';
import {
  getApplicationFromGAService,
  getCancelUrl,
  saveAdditionalText,
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

const respondAddInfoController = Router();
const viewPath = 'features/generalApplication/additionalInfoUpload/additional-info';
const headerCaption = 'PAGES.GENERAL_APPLICATION.RESPONDENT_UPLOAD_OPTION.TITLE';

respondAddInfoController.get(GA_RESPOND_ADDITIONAL_INFO_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const { appId, id: claimId } = req.params;
    const currentUrl = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_RESPOND_ADDITIONAL_INFO_URL);
    const claimIdPrettified = caseNumberPrettify(claimId);
    const claim = await getClaimById(claimId, req, true);
    const gaResponse = await getDraftGARespondentResponse(generateRedisKeyForGA(req));
    const cancelUrl = await getCancelUrl(claimId, claim);
    const backLinkUrl = BACK_URL;
    const additionalText = gaResponse.additionalText;
    const wantToUploadAddlDocuments = gaResponse.wantToUploadAddlDocuments;
    const respondAddInfo = new RespondAddInfo(wantToUploadAddlDocuments, additionalText);
    const form = new GenericForm(respondAddInfo);
    const applicationResponse: ApplicationResponse = await getApplicationFromGAService(req, appId);
    const docUrl = getRedirectUrl(appId, applicationResponse);
    res.render(viewPath, { currentUrl, backLinkUrl, cancelUrl, claimIdPrettified, claim, form, docUrl, headerCaption});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

respondAddInfoController.post(GA_RESPOND_ADDITIONAL_INFO_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const option = req.body.option;
    const text = req.body.additionalText;
    const { appId, id:claimId } = req.params;
    const currentUrl = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_RESPOND_ADDITIONAL_INFO_URL);
    const respondAddInfo = new RespondAddInfo(
      option,
      text,
    );
    const form = new GenericForm(respondAddInfo);
    await form.validate();
    if (form.hasErrors()) {
      const claimIdPrettified = caseNumberPrettify(claimId);
      const claim = await getClaimById(claimId, req, true);
      const cancelUrl = await getCancelUrl(claimId, claim);
      const backLinkUrl = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_RESPOND_ADDITIONAL_INFO_URL);
      const applicationResponse: ApplicationResponse = await getApplicationFromGAService(req, appId);
      const docUrl = getRedirectUrl(appId, applicationResponse);
      return res.render(viewPath, { currentUrl, backLinkUrl, cancelUrl, claimIdPrettified, claim, form, docUrl, headerCaption});
    }
    await saveAdditionalText(generateRedisKeyForGA(req), text, option);
    let redirectUrl;
    if (option == YesNo.YES) {
      redirectUrl = constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL);
    } else if (option == YesNo.NO) {
      redirectUrl = constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_CYA_URL);
    }
    res.redirect(redirectUrl);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

function getRedirectUrl(applicationId: string, applicationResponse: ApplicationResponse): string {
  const requestForInformationDocument = applicationResponse?.case_data?.requestForInformationDocument;
  if (requestForInformationDocument) {
    const doc = requestForInformationDocument.find(doc => doc?.value?.documentType === DocumentType.REQUEST_MORE_INFORMATION);
    const documentId = documentIdExtractor(doc?.value?.documentLink?.document_binary_url);
    return constructDocumentUrlWithIdParamsAndDocumentId(applicationId, documentId, GA_MAKE_WITH_NOTICE_DOCUMENT_VIEW_URL);
  }
  return undefined;
}

export default respondAddInfoController;
