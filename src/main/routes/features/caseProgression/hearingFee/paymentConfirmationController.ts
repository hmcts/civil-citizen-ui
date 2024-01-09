import {NextFunction, RequestHandler, Router} from 'express';
import {
  HEARING_FEE_PAYMENT_CONFIRMATION_URL, HEARING_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID,
} from 'routes/urls';

import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getRedirectUrl} from 'services/features/caseProgression/hearingFee/paymentConfirmationService';

const paymentConfirmationController: Router = Router();

paymentConfirmationController.get([HEARING_FEE_PAYMENT_CONFIRMATION_URL, HEARING_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID], (async (req:any, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const redirectUrl = await getRedirectUrl(claimId,req);
    res.redirect(constructResponseUrlWithIdParams(claimId, redirectUrl));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default paymentConfirmationController;
