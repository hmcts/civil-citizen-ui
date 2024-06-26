import {NextFunction, Request, RequestHandler, Router} from 'express';
import {
  HEARING_FEE_MAKE_PAYMENT_AGAIN_URL,
} from 'routes/urls';

import {getRedirectUrl} from 'services/features/caseProgression/hearingFee/makePaymentAgainService';
import {AppRequest} from 'models/AppRequest';

const makePaymentAgainController: Router = Router();

makePaymentAgainController.get(HEARING_FEE_MAKE_PAYMENT_AGAIN_URL, (async (req:AppRequest | Request, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const redirectUrl = await getRedirectUrl(claimId, <AppRequest>req);
    res.redirect(redirectUrl);
  }catch (error) {
    next(error);
  }
}) as RequestHandler);

export default makePaymentAgainController;
