import {NextFunction, RequestHandler, Response, Router} from 'express';
import {CLAIM_FEE_MAKE_PAYMENT_AGAIN_URL} from 'routes/urls';
import {getRedirectUrl} from 'services/features/claim/payment/claimFeeMakePaymentAgainService';
import {AppRequest} from 'models/AppRequest';
import {saveUserId} from 'modules/draft-store/paymentSessionStoreService';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {FeeType} from 'form/models/helpWithFees/feeType';

const claimFeeMakePaymentAgainController: Router = Router();

claimFeeMakePaymentAgainController.get(CLAIM_FEE_MAKE_PAYMENT_AGAIN_URL, (async (req:AppRequest, res:Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    const redirectUrl = await getRedirectUrl(claimId, <AppRequest>req);
    await saveUserId(claimId, FeeType.CLAIMISSUED, req.session.user.id);
    res.redirect(redirectUrl);
  }catch (error) {
    next(error);
  }
}) as RequestHandler);

export default claimFeeMakePaymentAgainController;
