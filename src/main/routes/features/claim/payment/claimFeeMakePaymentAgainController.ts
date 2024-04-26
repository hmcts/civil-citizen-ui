import {NextFunction, RequestHandler, Response, Router} from 'express';
import {CLAIM_FEE_MAKE_PAYMENT_AGAIN_URL} from 'routes/urls';
import {getRedirectUrl} from 'services/features/claim/payment/claimFeeMakePaymentAgainService';
import {AppRequest} from 'models/AppRequest';

const claimFeeMakePaymentAgainController: Router = Router();

claimFeeMakePaymentAgainController.get(CLAIM_FEE_MAKE_PAYMENT_AGAIN_URL, (async (req:AppRequest, res:Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const redirectUrl = await getRedirectUrl(claimId, <AppRequest>req);
    res.redirect(redirectUrl);
  }catch (error) {
    next(error);
  }
}) as RequestHandler);

export default claimFeeMakePaymentAgainController;
