import {NextFunction, RequestHandler, Router} from 'express';
import {CP_EVIDENCE_UPLOAD_CANCEL,  DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL} from '../../urls';
import {AppRequest} from 'common/models/AppRequest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {cancelDocumentUpload, getCancelYourUpload} from 'services/features/caseProgression/cancelDocumentUpload';
import {GenericForm} from 'form/models/genericForm';
import {CancelDocuments} from 'models/caseProgression/cancelDocuments';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {YesNo} from 'form/models/yesNo';
import {getClaimById} from 'modules/utilityService';

const cancelYourUploadViewPath = 'features/caseProgression/cancel-your-upload';
const cancelYourUploadController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

cancelYourUploadController.get(CP_EVIDENCE_UPLOAD_CANCEL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const form = new GenericForm(new CancelDocuments());
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    res.render(cancelYourUploadViewPath, {form, cancelYourUploadContents:getCancelYourUpload(claimId, claim)});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

cancelYourUploadController.post(CP_EVIDENCE_UPLOAD_CANCEL, (async (req:any, res, next) => {
  try {
    const option = req.body.option;
    const url = req.session.previousUrl;
    const claimId = req.params.id;
    const form = new GenericForm(new CancelDocuments(option));
    await form.validate();
    const claim: Claim = await getClaimById(claimId, req,true);
    if (form.hasErrors()) {
      res.render(cancelYourUploadViewPath, {form, cancelYourUploadContents: getCancelYourUpload(req.params.id, claim)});
    } else if(form.model.option === YesNo.NO) {
      res.redirect(url);
    } else {
      await cancelDocumentUpload(generateRedisKey(<AppRequest>req));
      res.redirect(constructResponseUrlWithIdParams(claimId, claim.isClaimant() ? DASHBOARD_CLAIMANT_URL : DEFENDANT_SUMMARY_URL));
    }
  } catch (error) {
    next(error);
  }
})as RequestHandler);

export default cancelYourUploadController;
