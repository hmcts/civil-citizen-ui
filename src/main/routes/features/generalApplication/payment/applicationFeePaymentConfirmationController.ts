import { AppRequest } from 'common/models/AppRequest';
import { constructResponseUrlWithIdParams } from 'common/utils/urlFormatter';
import {NextFunction,RequestHandler, Response, Router} from 'express';
import {APPLICATION_FEE_PAYMENT_CONFIRMATION_URL, APPLICATION_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID} from 'routes/urls';
import { getRedirectUrl } from 'services/features/generalApplication/payment/applicationFeePaymentConfirmationService';

const applicationFeePaymentConfirmationController: Router = Router();

applicationFeePaymentConfirmationController.get([APPLICATION_FEE_PAYMENT_CONFIRMATION_URL, APPLICATION_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID], (async (req: AppRequest, res: Response, next: NextFunction) => {

  try {
    const applicationId = req.params.appId;
    const redirectUrl = await getRedirectUrl(applicationId,req);
    res.redirect(constructResponseUrlWithIdParams(applicationId, redirectUrl));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default applicationFeePaymentConfirmationController;
