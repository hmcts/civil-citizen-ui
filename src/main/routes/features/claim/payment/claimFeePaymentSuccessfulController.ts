import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  DASHBOARD_URL, PAY_CLAIM_FEE_SUCCESSFUL_URL,
} from 'routes/urls';
import {
  getPaymentSuccessfulBodyContent, getPaymentSuccessfulButtonContent,
  getPaymentSuccessfulPanelContent,
} from 'services/features/claim/payment/claimFeePaymentConfirmationContent';
import {AppRequest} from 'models/AppRequest';
import { CivilServiceClient } from 'client/civilServiceClient';
import config from 'config';
const paymentSuccessfulController: Router = Router();

const paymentSuccessfulViewPath  = 'features/claim/payment/claim-fee-payment-successful';
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

async function renderView(res: Response, req: AppRequest, claimId: string, redirectUrl: string) {
  const claim = await civilServiceClient.retrieveClaimDetails(claimId, req);
  const lng = req.query.lang ? req.query.lang : req.cookies.lang;
  res.render(paymentSuccessfulViewPath,
    {
      paymentSuccessfulPanel: getPaymentSuccessfulPanelContent(claim, lng),
      paymentSuccessfulBody: getPaymentSuccessfulBodyContent(claim, lng),
      paymentSuccessfulButton: getPaymentSuccessfulButtonContent(redirectUrl),
      pageTitle: 'PAGES.PAY_HEARING_FEE.CONFIRMATION_PAGE.TITLE_CLAIM_FEE',
    });
}

paymentSuccessfulController.get(PAY_CLAIM_FEE_SUCCESSFUL_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    await renderView(res, req, claimId, DASHBOARD_URL);
  }catch (error) {
    next(error);
  }
}) as RequestHandler);

export default paymentSuccessfulController;
