import {NextFunction, RequestHandler, Router} from 'express';
import {
  HEARING_FEE_MAKE_PAYMENT_AGAIN,
} from 'routes/urls';

import {getRedirectUrl} from 'services/features/caseProgression/hearingFee/makePaymentAgainService';

const makePaymentAgainController: Router = Router();

makePaymentAgainController.get(HEARING_FEE_MAKE_PAYMENT_AGAIN, (async (req:any, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const redirectUrl = await getRedirectUrl(claimId, req);
    res.redirect(redirectUrl);
  }catch (error) {
    next(error);
  }
}) as RequestHandler);

export default makePaymentAgainController;
