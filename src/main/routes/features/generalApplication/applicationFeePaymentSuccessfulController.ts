import { NextFunction, RequestHandler, Response, Router } from 'express';
import {GA_APPLICATION_SUBMITTED_URL, GA_PAYMENT_SUCCESSFUL_URL} from 'routes/urls';
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
  const withoutFee = !appId;
  const applicationResponse = appId ? await getApplicationFromGAService(req, appId) : undefined;
  let calculatedAmountInPence = applicationResponse?.case_data?.generalAppPBADetails?.fee?.calculatedAmountInPence;
  if (!calculatedAmountInPence) {
    calculatedAmountInPence = '0';
  }
  const lng = req.query.lang ? req.query.lang : req.cookies.lang;
  const isAdditionalFee = !!applicationResponse?.case_data?.generalAppPBADetails?.additionalPaymentServiceRef;
  res.render(paymentSuccessfulViewPath,
    {
      gaPaymentSuccessfulPanel: getGaPaymentSuccessfulPanelContent(claim, withoutFee, isAdditionalFee, lng, applicationResponse),
      gaPaymentSuccessfulBody: getGaPaymentSuccessfulBodyContent(claim, String(calculatedAmountInPence), isAdditionalFee, withoutFee,
        shouldDisplaySyncWarning(applicationResponse), lng),
      gaPaymentSuccessfulButton: getGaPaymentSuccessfulButtonContent(await getCancelUrl(claimId, claim)),
      noCrumbs: true,
      pageTitle: 'PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.TITLE',
    });
}

applicationFeePaymentSuccessfulController.get([GA_PAYMENT_SUCCESSFUL_URL, GA_APPLICATION_SUBMITTED_URL], (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const applicationId = req.params.appId;
    await renderView(res, req, claimId, applicationId);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default applicationFeePaymentSuccessfulController;
