import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  GA_RESPONDENT_UPLOAD_DOCUMENT,
  GA_RESPONDENT_HEARING_PREFERENCE,
  GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT,
} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getCancelUrl, getRespondToApplicationCaption, saveRespondentWantToUploadDoc,}
  from 'services/features/generalApplication/generalApplicationService';
import {GenericYesNo} from 'form/models/genericYesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {YesNo} from 'form/models/yesNo';

const respondentWantToUploadDocumentsController = Router();
const viewPath = 'features/generalApplication/respondent-want-to-upload-documents';

async function renderView(req: AppRequest | Request, form: GenericForm<GenericYesNo>, claim: Claim, claimId: string, res: Response): Promise<void> {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const applicationType: string = getRespondToApplicationCaption(claim, lang);
  const cancelUrl = await getCancelUrl(claimId, claim);
  const backLinkUrl = constructResponseUrlWithIdParams(claimId, GA_RESPONDENT_HEARING_PREFERENCE);
  res.render(viewPath, {
    form,
    cancelUrl,
    backLinkUrl,
    applicationType,
  });
}

respondentWantToUploadDocumentsController.get(GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const form = new GenericForm(new GenericYesNo(claim.generalApplication?.gaResponse?.wantToUploadDocuments));
    await renderView(req, form, claim, claimId, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

respondentWantToUploadDocumentsController.post(GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const redisKey = generateRedisKey(<AppRequest>req);
    const form = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.GENERAL_APPLICATION.RESPONDENT_WANT_TO_UPLOAD_DOC_YES_NO_SELECTION'));
    await form.validate();

    if (form.hasErrors()) {
      await  renderView(req, form, claim, claimId, res);
    } else {
      let redirectUrl;
      if (req.body.option == YesNo.YES) {
        redirectUrl = constructResponseUrlWithIdParams(claimId, GA_RESPONDENT_UPLOAD_DOCUMENT);
      } else if (req.body.option == YesNo.NO) {
        redirectUrl = 'test'; // TODO: add url
      }
      await saveRespondentWantToUploadDoc(redisKey, claim, req.body.option);
      res.redirect(redirectUrl);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);
export default respondentWantToUploadDocumentsController;
