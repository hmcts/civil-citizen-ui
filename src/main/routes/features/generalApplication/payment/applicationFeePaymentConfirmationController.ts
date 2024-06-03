import {NextFunction,RequestHandler, Response, Router} from 'express';
import {APPLICATION_FEE_PAYMENT_CONFIRMATION_URL, APPLICATION_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getRedirectUrl} from 'services/features/claim/payment/claimFeePaymentConfirmationService';
import {AppRequest} from 'common/models/AppRequest';

const claimFeePaymentConfirmationController: Router = Router();

claimFeePaymentConfirmationController.get([APPLICATION_FEE_PAYMENT_CONFIRMATION_URL, APPLICATION_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID], (async (req: AppRequest, res: Response, next: NextFunction) => {

  try {
    const claimId = req.params.id;
    const redirectUrl = await getRedirectUrl(claimId,req);
    res.redirect(constructResponseUrlWithIdParams(claimId, redirectUrl));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default claimFeePaymentConfirmationController;
