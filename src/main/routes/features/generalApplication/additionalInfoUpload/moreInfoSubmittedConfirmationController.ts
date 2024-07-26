import { AppRequest } from 'common/models/AppRequest';
import { NextFunction, RequestHandler, Response, Router } from 'express';
import { deleteDraftClaimFromStore, generateRedisKey } from 'modules/draft-store/draftStoreService';
import { getClaimById } from 'modules/utilityService';
import {
  GA_UPLOAD_DOCUMENT_FOR_REQUEST_MORE_INFO_CONFIRMATION_URL,
} from 'routes/urls';
import {
  getConfirmationContent,
} from 'services/features/generalApplication/additionalInfoUpload/uploadDocumentsForReqMoreInfoService';
import {t} from 'i18next';

const moreInfoSubmittedConfirmationController = Router();
const viewPath = 'features/generalApplication/additionalInfoUpload/confirmation-screen';

moreInfoSubmittedConfirmationController.get(GA_UPLOAD_DOCUMENT_FOR_REQUEST_MORE_INFO_CONFIRMATION_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const { id: claimId } = req.params;
    const claim = await getClaimById(claimId, req, true);
    const redisKey = generateRedisKey(req);
    await deleteDraftClaimFromStore(redisKey);
    res.render(viewPath, {
      confirmationTitle : t('PAGES.GENERAL_APPLICATION.UPLOAD_MORE_INFO_DOCUMENTS.CONFIRMATION_PAGE_TITLE', {lng}),
      confirmationContent: await getConfirmationContent(claimId, claim, lng),
    });
  } catch (err) {
    next(err);
  }
}) as RequestHandler);

export default moreInfoSubmittedConfirmationController;
