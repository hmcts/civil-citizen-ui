import { AppRequest } from 'common/models/AppRequest';
import { NextFunction, RequestHandler, Response, Router } from 'express';
import { deleteDraftClaimFromStore, generateRedisKeyForGA } from 'modules/draft-store/draftStoreService';
import { getClaimById } from 'modules/utilityService';
import {
  GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_CONFIRMATION_URL,
} from 'routes/urls';
import {
  getConfirmationContent,
} from 'services/features/generalApplication/directionsOrderUpload/uploadDocumentsDirectionsOrderService';
import {t} from 'i18next';

const directionOrderSubmittedConfirmationController = Router();
const viewPath = 'features/generalApplication/directionsOrderUpload/confirmation-screen';

directionOrderSubmittedConfirmationController.get(GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_CONFIRMATION_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const { id: claimId } = req.params;
    const claim = await getClaimById(claimId, req, true);
    const redisKey = generateRedisKeyForGA(req);
    await deleteDraftClaimFromStore(redisKey);
    res.render(viewPath, {
      confirmationTitle : t('PAGES.GENERAL_APPLICATION.UPLOAD_DIRECTIONS_ORDER_DOCUMENTS.CONFIRMATION_PAGE_TITLE', {lng}),
      confirmationContent: await getConfirmationContent(claimId, claim, lng),
    });
  } catch (err) {
    next(err);
  }
}) as RequestHandler);

export default directionOrderSubmittedConfirmationController;
