import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  MEDIATION_UPLOAD_DOCUMENTS_CANCEL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {CancelDocuments} from 'models/caseProgression/cancelDocuments';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {YesNo} from 'form/models/yesNo';
const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('mediationCancelUploadController');
import {
  cancelMediationDocumentUpload,
  getCancelYourUpload,
} from 'services/features/mediation/uploadDocuments/mediationCancelUploadService';

const cancelYourUploadViewPath = 'features/mediation/uploadDocuments/cancel-your-upload';
const mediationCancelUploadController = Router();

mediationCancelUploadController.get(MEDIATION_UPLOAD_DOCUMENTS_CANCEL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  const userid = (<AppRequest>req).session.user?.id;
  try {
    const claimId = req.params.id;
    const redisKey = generateRedisKey(req);
    const claim = await getCaseDataFromStore(redisKey);
    const form = new GenericForm(new CancelDocuments());
    res.render(cancelYourUploadViewPath, {form, cancelYourUploadContents: getCancelYourUpload(claimId, claim)});
  } catch (error) {
    logger.error('Error in getting mediation document upload', {
      error,
      userid,
      claimId: req.params.id,
      route: MEDIATION_UPLOAD_DOCUMENTS_CANCEL,
    });
    next(error);
  }
}) as RequestHandler);

mediationCancelUploadController.post(MEDIATION_UPLOAD_DOCUMENTS_CANCEL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  const userid = (<AppRequest>req).session.user?.id;
  try {
    const option = req.body.option;
    const url = req.session.previousUrl || constructResponseUrlWithIdParams(req.params.id, MEDIATION_UPLOAD_DOCUMENTS_CANCEL.replace('/cancel-document-upload', ''));
    const claimId = req.params.id;
    const redisKey = generateRedisKey(req);
    const claim = await getCaseDataFromStore(redisKey);
    const form = new GenericForm(new CancelDocuments(option));
    await form.validate();
    if (form.hasErrors()) {
      res.render(cancelYourUploadViewPath, {form, cancelYourUploadContents: getCancelYourUpload(claimId, claim)});
    } else if (form.model.option === YesNo.NO) {
      res.redirect(url);
    } else {
      await cancelMediationDocumentUpload(redisKey, claim);
      req.session.previousUrl = undefined;
      res.redirect(constructResponseUrlWithIdParams(claimId, claim.isClaimant() ? DASHBOARD_CLAIMANT_URL : DEFENDANT_SUMMARY_URL));
    }
  } catch (error) {
    logger.error('Error cancelling mediation document upload', {
      error,
      userid,
      claimId: req.params.id,
      route: MEDIATION_UPLOAD_DOCUMENTS_CANCEL,
    });
    next(error);
  }
}) as RequestHandler);

export default mediationCancelUploadController;
