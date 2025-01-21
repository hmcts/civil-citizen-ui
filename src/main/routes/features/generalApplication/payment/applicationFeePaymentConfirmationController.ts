import { AppRequest } from 'common/models/AppRequest';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {NextFunction,RequestHandler, Response, Router} from 'express';
import {APPLICATION_FEE_PAYMENT_CONFIRMATION_URL, APPLICATION_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID} from 'routes/urls';
import { getRedirectUrl } from 'services/features/generalApplication/payment/applicationFeePaymentConfirmationService';
import {deleteDraftClaimFromStore} from 'modules/draft-store/draftStoreService';

const applicationFeePaymentConfirmationController: Router = Router();

applicationFeePaymentConfirmationController.get([APPLICATION_FEE_PAYMENT_CONFIRMATION_URL, APPLICATION_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID], (async (req: AppRequest, res: Response, next: NextFunction) => {

  try {
    const claimId = req.params.id;
    const applicationId = req.params.appId;
    await deleteDraftClaimFromStore(claimId + 'userIdForPayment');
    const redirectUrl = await getRedirectUrl(claimId, applicationId, req);
    res.redirect(constructResponseUrlWithIdAndAppIdParams(claimId, applicationId, redirectUrl));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default applicationFeePaymentConfirmationController;
