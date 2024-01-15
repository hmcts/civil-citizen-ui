import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  PAY_CLAIM_FEE_UNSUCCESSFUL_URL,
} from 'routes/urls';
import {
 getPaymentUnsuccessfulBodyContent,
} from 'services/features/claim/payment/claimFeePaymentConfirmationContent';
import {Claim} from 'models/claim';
import {getClaimById} from 'modules/utilityService';
import {AppRequest} from 'models/AppRequest';
import {deleteDraftClaimFromStore, generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getLng} from "common/utils/languageToggleUtils";
const paymentUnsuccessfulController: Router = Router();

const paymentUnsuccessfulViewPath  = 'features/claim/payment/claim-fee-payment-unsuccessful';

async function renderView(res: Response, req: any, claimId: string) {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const claim: Claim = await getClaimById(claimId, req, true);
  const redisClaimId = generateRedisKey(req);
  await deleteDraftClaimFromStore(redisClaimId);
  res.render(paymentUnsuccessfulViewPath,
    {
      paymentUnsuccessfulBody: getPaymentUnsuccessfulBodyContent(claim, getLng(lang), claimId),
    });
}

paymentUnsuccessfulController.get(PAY_CLAIM_FEE_UNSUCCESSFUL_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    await renderView(res, req, claimId);
  }catch (error) {
    next(error);
  }
}) as RequestHandler);

export default paymentUnsuccessfulController;
