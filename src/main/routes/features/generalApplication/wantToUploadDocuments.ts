import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  BACK_URL,
  GA_HEARING_ARRANGEMENTS_GUIDANCE_URL,
  GA_UPLOAD_DOCUMENTS_URL,
  GA_WANT_TO_UPLOAD_DOCUMENTS_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {Claim} from 'models/claim';
import {
  getCancelUrl,
  getDynamicHeaderForMultipleApplications,
  saveIfPartyWantsToUploadDoc,
} from 'services/features/generalApplication/generalApplicationService';
import {getClaimById} from 'modules/utilityService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams, constructUrlWithIndex} from 'common/utils/urlFormatter';
import {YesNo} from 'form/models/yesNo';
import {removeAllUploadedDocuments} from 'services/features/generalApplication/uploadEvidenceDocumentService';
import {queryParamNumber} from 'common/utils/requestUtils';

const wantToUploadDocumentsController = Router();
const viewPath = 'features/generalApplication/want-to-upload-documents';

async function renderView(form: GenericForm<GenericYesNo>, claim: Claim, claimId: string, res: Response, index: number): Promise<void> {
  const backLinkUrl = BACK_URL;
  const cancelUrl = await getCancelUrl(claimId, claim);
  res.render(viewPath, {
    form,
    cancelUrl,
    backLinkUrl,
    headerTitle: getDynamicHeaderForMultipleApplications(claim),
  });
}

wantToUploadDocumentsController.get(GA_WANT_TO_UPLOAD_DOCUMENTS_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const index  = queryParamNumber(req, 'index') || claim.generalApplication.applicationTypes.length - 1;
    const form = new GenericForm(new GenericYesNo(claim.generalApplication?.wantToUploadDocuments));
    await renderView(form, claim, claimId, res, index);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

wantToUploadDocumentsController.post(GA_WANT_TO_UPLOAD_DOCUMENTS_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;

    const claim = await getClaimById(claimId, req, true);
    const index  = queryParamNumber(req, 'index') || claim.generalApplication.applicationTypes.length - 1;
    const redisKey = generateRedisKey(req);
    const form = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.GENERAL_APPLICATION.WANT_TO_UPLOAD_DOCUMENTS_YES_NO_SELECTION'));
    await form.validate();

    if (form.hasErrors()) {
      await renderView(form, claim, claimId, res, index);
    } else {
      let redirectUrl;
      if (req.body.option == YesNo.YES) {
        redirectUrl = constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_UPLOAD_DOCUMENTS_URL), index);
      } else if (req.body.option == YesNo.NO) {
        await removeAllUploadedDocuments(redisKey, claim);
        redirectUrl = constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_HEARING_ARRANGEMENTS_GUIDANCE_URL), index);
      }
      await saveIfPartyWantsToUploadDoc(redisKey, req.body.option);
      res.redirect(redirectUrl);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);
export default wantToUploadDocumentsController;
