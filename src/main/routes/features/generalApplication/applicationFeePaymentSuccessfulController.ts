import {NextFunction, RequestHandler, Response, Router} from 'express';
import { DASHBOARD_URL, GA_PAYMENT_SUCCESSFUL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import { CivilServiceClient } from 'client/civilServiceClient';
import config from 'config';
import { getGaPaymentSuccessfulBodyContent, getGaPaymentSuccessfulButtonContent, getGaPaymentSuccessfulPanelContent } from 'services/features/generalApplication/applicationFeePaymentConfirmationContent';
const applicationFeePaymentSuccessfulController: Router = Router();

const paymentSuccessfulViewPath  = 'features/generalApplication/payment-successful';
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

async function renderView(res: Response, req: AppRequest, claimId: string, redirectUrl: string) {
  const claim = await civilServiceClient.retrieveClaimDetails(claimId, req);
  const lng = req.query.lang ? req.query.lang : req.cookies.lang;
  res.render(paymentSuccessfulViewPath,
    {
      gaPaymentSuccessfulPanel: getGaPaymentSuccessfulPanelContent(claim, lng),
      gaPaymentSuccessfulBody: getGaPaymentSuccessfulBodyContent(claim, lng),
      gaPaymentSuccessfulButton: getGaPaymentSuccessfulButtonContent(redirectUrl),
    });
}

applicationFeePaymentSuccessfulController.get(GA_PAYMENT_SUCCESSFUL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    await renderView(res, req, claimId, DASHBOARD_URL);
  }catch (error) {
    next(error);
  }
}) as RequestHandler);

export default applicationFeePaymentSuccessfulController;
