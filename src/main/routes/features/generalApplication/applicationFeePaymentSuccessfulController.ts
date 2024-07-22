import { NextFunction, RequestHandler, Response, Router } from 'express';
import { GA_PAYMENT_SUCCESSFUL_URL } from 'routes/urls';
import { AppRequest } from 'models/AppRequest';
import { getGaPaymentSuccessfulBodyContent, getGaPaymentSuccessfulButtonContent, getGaPaymentSuccessfulPanelContent } from 'services/features/generalApplication/applicationFeePaymentConfirmationContent';
import {
  getApplicationFromGAService,
  getCancelUrl, shouldDisplaySyncWarning,
} from 'services/features/generalApplication/generalApplicationService';
import {getClaimById} from 'modules/utilityService';
const applicationFeePaymentSuccessfulController: Router = Router();

const paymentSuccessfulViewPath = 'features/generalApplication/payment-successful';

async function renderView(res: Response, req: AppRequest, claimId: string, appId: string) {
  const claim = await getClaimById(claimId, req, true);
  const applicationResponse = await getApplicationFromGAService(req, appId);
  const calculatedAmountInPence = applicationResponse?.case_data?.generalAppPBADetails?.fee?.calculatedAmountInPence;
  const lng = req.query.lang ? req.query.lang : req.cookies.lang;
  const isAdditionalFee = !!applicationResponse?.case_data?.generalAppPBADetails?.additionalPaymentServiceRef;
  res.render(paymentSuccessfulViewPath,
    {
      gaPaymentSuccessfulPanel: getGaPaymentSuccessfulPanelContent(claim, lng),
      gaPaymentSuccessfulBody: getGaPaymentSuccessfulBodyContent(claim, String(calculatedAmountInPence), isAdditionalFee,
        shouldDisplaySyncWarning(applicationResponse), lng),
      gaPaymentSuccessfulButton: getGaPaymentSuccessfulButtonContent(await getCancelUrl(claimId, claim)),
    });
}

applicationFeePaymentSuccessfulController.get(GA_PAYMENT_SUCCESSFUL_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const applicationId = req.params.appId;
    await renderView(res, req, claimId, applicationId);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default applicationFeePaymentSuccessfulController;
