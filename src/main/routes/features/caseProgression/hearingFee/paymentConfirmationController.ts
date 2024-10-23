import {NextFunction, Request, RequestHandler, Router} from 'express';
import {
  HEARING_FEE_PAYMENT_CONFIRMATION_URL, HEARING_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID,
} from 'routes/urls';

import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getRedirectUrl} from 'services/features/caseProgression/hearingFee/paymentConfirmationService';
import {AppRequest} from 'models/AppRequest';
import {deleteDraftClaimFromStore} from 'modules/draft-store/draftStoreService';

const paymentConfirmationController: Router = Router();

paymentConfirmationController.get([HEARING_FEE_PAYMENT_CONFIRMATION_URL, HEARING_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID], (async (req:AppRequest | Request, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    await deleteDraftClaimFromStore(claimId + 'userIdForPayment');
    const redirectUrl = await getRedirectUrl(claimId,<AppRequest>req);
    res.redirect(constructResponseUrlWithIdParams(claimId, redirectUrl));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default paymentConfirmationController;
