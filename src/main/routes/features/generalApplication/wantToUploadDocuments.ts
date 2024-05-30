import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  GA_HEARING_ARRANGEMENTS_GUIDANCE,
  GA_UPLOAD_DOCUMENTS,
  GA_WANT_TO_UPLOAD_DOCUMENTS,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {Claim} from 'models/claim';
import {selectedApplicationType} from 'models/generalApplication/applicationType';
import {
  getCancelUrl,
  saveIfPartyWantsToUploadDoc,
} from 'services/features/generalApplication/generalApplicationService';
import {getClaimById} from 'modules/utilityService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {YesNo} from 'form/models/yesNo';
import {removeAllUploadedDocuments} from 'services/features/generalApplication/uploadEvidenceDocumentService';

const wantToUploadDocumentsController = Router();
const viewPath = 'features/generalApplication/want-to-upload-documents';
const backLinkUrl = 'test'; // TODO: add url

async function renderView(form: GenericForm<GenericYesNo>, claim: Claim, claimId: string, res: Response): Promise<void> {
  const applicationType = selectedApplicationType[claim.generalApplication?.applicationType?.option];
  const cancelUrl = await getCancelUrl(claimId, claim);
  res.render(viewPath, {
    form,
    cancelUrl,
    backLinkUrl,
    applicationType,
  });
}

wantToUploadDocumentsController.get(GA_WANT_TO_UPLOAD_DOCUMENTS, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const form = new GenericForm(new GenericYesNo(claim.generalApplication?.wantToUploadDocuments));
    await renderView(form, claim, claimId, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

wantToUploadDocumentsController.post(GA_WANT_TO_UPLOAD_DOCUMENTS, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const redisKey = generateRedisKey(req);
    const form = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.GENERAL_APPLICATION.WANT_TO_UPLOAD_DOCUMENTS_YES_NO_SELECTION'));
    await form.validate();

    if (form.hasErrors()) {
      await renderView(form, claim, claimId, res);
    } else {
      let redirectUrl;
      if (req.body.option == YesNo.YES) {
        redirectUrl = constructResponseUrlWithIdParams(claimId, GA_UPLOAD_DOCUMENTS);
      } else if (req.body.option == YesNo.NO) {
        await removeAllUploadedDocuments(redisKey, claim);
        redirectUrl = constructResponseUrlWithIdParams(claimId, GA_HEARING_ARRANGEMENTS_GUIDANCE);
      }
      await saveIfPartyWantsToUploadDoc(redisKey, req.body.option);
      res.redirect(redirectUrl);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);
export default wantToUploadDocumentsController;
