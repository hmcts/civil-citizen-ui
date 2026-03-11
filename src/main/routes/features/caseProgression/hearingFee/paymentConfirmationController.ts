import {NextFunction, Request, RequestHandler, Router} from 'express';
import {
  HEARING_FEE_PAYMENT_CONFIRMATION_URL, HEARING_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID,
} from 'routes/urls';

import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getRedirectUrl} from 'services/features/caseProgression/hearingFee/paymentConfirmationService';
import {AppRequest} from 'models/AppRequest';
import {deletePaymentSessionData} from 'modules/draft-store/paymentSessionStoreService';

const paymentConfirmationController: Router = Router();

paymentConfirmationController.get([HEARING_FEE_PAYMENT_CONFIRMATION_URL, HEARING_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID], (async (req:AppRequest | Request, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    await deletePaymentSessionData(claimId);
    const redirectUrl = await getRedirectUrl(claimId,<AppRequest>req);
    res.redirect(constructResponseUrlWithIdParams(claimId, redirectUrl));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default paymentConfirmationController;
