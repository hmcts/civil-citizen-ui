import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  DASHBOARD_URL, PAY_CLAIM_FEE_SUCCESSFUL_URL,
} from 'routes/urls';
import {
  getPaymentSuccessfulBodyContent, getPaymentSuccessfulButtonContent,
  getPaymentSuccessfulPanelContent,
} from 'services/features/claim/payment/claimFeePaymentConfirmationContent';
import {Claim} from 'models/claim';
import {getClaimById} from 'modules/utilityService';
import {AppRequest} from 'models/AppRequest';
import {deleteDraftClaimFromStore, generateRedisKey} from 'modules/draft-store/draftStoreService';
const paymentSuccessfulController: Router = Router();

const paymentSuccessfulViewPath  = 'features/claim/payment/claim-fee-payment-successful';

async function renderView(res: Response, req: any, claimId: string, redirectUrl: string) {
  const claim: Claim = await getClaimById(claimId, req, true);
  const redisClaimId = generateRedisKey(req);
  await deleteDraftClaimFromStore(redisClaimId);
  res.render(paymentSuccessfulViewPath,
    {
      paymentSuccessfulPanel: getPaymentSuccessfulPanelContent(claim),
      paymentSuccessfulBody: getPaymentSuccessfulBodyContent(claim),
      paymentSuccessfulButton: getPaymentSuccessfulButtonContent(redirectUrl),
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
