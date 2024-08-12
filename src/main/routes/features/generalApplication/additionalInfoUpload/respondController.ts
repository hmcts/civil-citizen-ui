import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  GA_RESPOND_ADDITIONAL_INFO_URL, GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_CYA_URL,
  GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL,
  GA_VIEW_APPLICATION_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {getClaimById} from 'modules/utilityService';
import {
  getCancelUrl, saveAdditionalText,
} from 'services/features/generalApplication/generalApplicationService';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'form/models/genericForm';
import {RespondAddInfo} from 'models/generalApplication/response/respondAddInfo';
import {generateRedisKeyForGA} from 'modules/draft-store/draftStoreService';
import {
  getDraftGARespondentResponse,
} from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {YesNo} from 'form/models/yesNo';

const respondAddInfoController = Router();
const viewPath = 'features/generalApplication/additionalInfoUpload/additional-info';

respondAddInfoController.get(GA_RESPOND_ADDITIONAL_INFO_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const { appId, id: claimId } = req.params;
    const currentUrl = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_RESPOND_ADDITIONAL_INFO_URL);
    const claimIdPrettified = caseNumberPrettify(claimId);
    const claim = await getClaimById(claimId, req, true);
    const gaResponse = await getDraftGARespondentResponse(generateRedisKeyForGA(req));
    const cancelUrl = await getCancelUrl(claimId, claim);
    const backLinkUrl = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_RESPOND_ADDITIONAL_INFO_URL);
    const docUrl = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_VIEW_APPLICATION_URL).concat('?index=1');
    const additionalText = gaResponse.additionalText;
    const wantToUploadAddlDocuments = gaResponse.wantToUploadAddlDocuments;
    const respondAddInfo = new RespondAddInfo(wantToUploadAddlDocuments, additionalText);
    const form = new GenericForm(respondAddInfo);
    res.render(viewPath, { currentUrl, backLinkUrl, cancelUrl, claimIdPrettified, claim, form, docUrl});
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
      const docUrl = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_VIEW_APPLICATION_URL).concat('?index=1');
      return res.render(viewPath, { currentUrl, backLinkUrl, cancelUrl, claimIdPrettified, claim, form, docUrl});
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

export default respondAddInfoController;