import {NextFunction, RequestHandler, Response, Router} from "express";
import {constructResponseUrlWithIdParams} from "common/utils/urlFormatter";
import {
  DASHBOARD_CLAIMANT_URL,
  PAYMENT_SUCCESSFUL_URL
} from "routes/urls";
import {getPaymentSuccessfulPanelContent} from "services/features/claim/paymentSuccessfulContents";
import {Claim} from "models/claim";
import {getClaimById} from "modules/utilityService";
const paymentSuccessfulController: Router = Router();

const paymentSuccessfulViewPath  = 'payment-successful';

async function renderView(res: Response, req: any, form: any, claimId: string, redirectUrl: string) {
  let claim: Claim = await getClaimById(claimId, req, true);
  res.render(paymentSuccessfulViewPath,
    {
      paymentSuccessfulPanel: getPaymentSuccessfulPanelContent(claim),
      paymentSuccessfulBody: getPaymentSuccessfulBodyContent(),
      paymentSuccessfulButton: getPaymentSuccessfulButtonContent(),
    });
}

paymentSuccessfulController.get(PAYMENT_SUCCESSFUL_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const redirectUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
    await renderView(res, req, null, claimId, redirectUrl);
  }catch (error) {
    next(error);
  }
}) as RequestHandler);

export default paymentSuccessfulController;
