import {NextFunction, RequestHandler, Response, Router} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  DASHBOARD_CLAIMANT_URL, PAY_HEARING_FEE_SUCCESSFUL_URL,
} from 'routes/urls';
import {
  getPaymentSuccessfulBodyContent, getPaymentSuccessfulButtonContent,
  getPaymentSuccessfulPanelContent,
} from 'services/features/claim/paymentSuccessfulContents';
import {Claim} from 'models/claim';
import {getClaimById} from 'modules/utilityService';
const paymentSuccessfulController: Router = Router();

const paymentSuccessfulViewPath  = 'features/claim/payment-successful';

async function renderView(res: Response, req: any, claimId: string, redirectUrl: string) {
  const claim: Claim = await getClaimById(claimId, req, true);

  res.render(paymentSuccessfulViewPath,
    {
      paymentSuccessfulPanel: getPaymentSuccessfulPanelContent(claim),
      paymentSuccessfulBody: getPaymentSuccessfulBodyContent(claim),
      paymentSuccessfulButton: getPaymentSuccessfulButtonContent(redirectUrl),
    });
}

paymentSuccessfulController.get(PAY_HEARING_FEE_SUCCESSFUL_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const redirectUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
    await renderView(res, req, claimId, redirectUrl);
  }catch (error) {
    next(error);
  }
}) as RequestHandler);

export default paymentSuccessfulController;
