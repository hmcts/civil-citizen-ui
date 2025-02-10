import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  GA_RESPONDENT_HEARING_PREFERENCE_URL,
  GA_RESPONDENT_UPLOAD_DOCUMENT_URL,
  GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL,
  BACK_URL,
} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {AppRequest} from 'models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {generateRedisKeyForGA} from 'modules/draft-store/draftStoreService';
import {
  getCancelUrl,
  saveRespondentWantToUploadDoc,
} from 'services/features/generalApplication/generalApplicationService';
import {GenericYesNo} from 'form/models/genericYesNo';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {YesNo} from 'form/models/yesNo';
import {
  getRespondToApplicationCaption,
} from 'services/features/generalApplication/response/generalApplicationResponseService';
import {
  getDraftGARespondentResponse,
} from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {GaResponse} from 'models/generalApplication/response/gaResponse';

const respondentWantToUploadDocumentsController = Router();
const viewPath = 'features/generalApplication/response/respondent-want-to-upload-documents';

async function renderView(req: AppRequest | Request, form: GenericForm<GenericYesNo>, claim: Claim, gaResponse: GaResponse, backLinkUrl: string, res: Response): Promise<void> {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const applicationType: string = getRespondToApplicationCaption(gaResponse.generalApplicationType, lang);
  const cancelUrl = await getCancelUrl(req.params.id, claim);
  res.render(viewPath, {
    form,
    cancelUrl,
    backLinkUrl,
    applicationType,
  });
}

respondentWantToUploadDocumentsController.get(GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const gaResponse = await getDraftGARespondentResponse(generateRedisKeyForGA(req));
    const backLinkUrl = BACK_URL;
    const form = new GenericForm(new GenericYesNo(gaResponse.wantToUploadDocuments));
    await renderView(req, form, claim, gaResponse, backLinkUrl, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

respondentWantToUploadDocumentsController.post(GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const gaResponse = await getDraftGARespondentResponse(generateRedisKeyForGA(<AppRequest>req));
    const backLinkUrl = BACK_URL;
    const form = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.GENERAL_APPLICATION.RESPONDENT_WANT_TO_UPLOAD_DOC_YES_NO_SELECTION'));
    await form.validate();

    if (form.hasErrors()) {
      await renderView(req, form, claim, gaResponse, backLinkUrl, res);
    } else {
      let redirectUrl;
      if (req.body.option == YesNo.YES) {
        redirectUrl = constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_RESPONDENT_UPLOAD_DOCUMENT_URL);
      } else if (req.body.option == YesNo.NO) {
        redirectUrl = constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_RESPONDENT_HEARING_PREFERENCE_URL);
      }
      await saveRespondentWantToUploadDoc(generateRedisKeyForGA(<AppRequest>req), req.body.option);
      res.redirect(redirectUrl);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default respondentWantToUploadDocumentsController;
