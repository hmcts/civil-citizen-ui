import { NextFunction, RequestHandler, Response, Router } from 'express';
import { GA_PAYMENT_SUCCESSFUL_URL } from 'routes/urls';
import { AppRequest } from 'models/AppRequest';
import { getGaPaymentSuccessfulBodyContent, getGaPaymentSuccessfulButtonContent, getGaPaymentSuccessfulPanelContent } from 'services/features/generalApplication/applicationFeePaymentConfirmationContent';
import { getCancelUrl } from 'services/features/generalApplication/generalApplicationService';
import { generateRedisKey, getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
const applicationFeePaymentSuccessfulController: Router = Router();

const paymentSuccessfulViewPath = 'features/generalApplication/payment-successful';

async function renderView(res: Response, req: AppRequest, claimId: string) {
  const redisKey = generateRedisKey(req);
  const claim = await getCaseDataFromStore(redisKey);
  const lng = req.query.lang ? req.query.lang : req.cookies.lang;
  res.render(paymentSuccessfulViewPath,
    {
      gaPaymentSuccessfulPanel: getGaPaymentSuccessfulPanelContent(claim, lng),
      gaPaymentSuccessfulBody: getGaPaymentSuccessfulBodyContent(claim, lng),
      gaPaymentSuccessfulButton: getGaPaymentSuccessfulButtonContent(await getCancelUrl(claimId, claim)),
    });
}

applicationFeePaymentSuccessfulController.get(GA_PAYMENT_SUCCESSFUL_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    await renderView(res, req, claimId);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default applicationFeePaymentSuccessfulController;
