import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  PAY_CLAIM_FEE_UNSUCCESSFUL_URL,
} from 'routes/urls';
import {
  getPaymentUnsuccessfulBodyContent,
} from 'services/features/claim/payment/claimFeePaymentConfirmationContent';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {
  // deleteDraftClaimFromStore,
  generateRedisKey,
  getCaseDataFromStore,
  saveDraftClaim,
} from 'modules/draft-store/draftStoreService';
import {getLng} from 'common/utils/languageToggleUtils';
import {getFeePaymentRedirectInformation} from 'services/features/feePayment/feePaymentService';
import {FeeType} from 'form/models/helpWithFees/feeType';
const paymentUnsuccessfulController: Router = Router();

const paymentUnsuccessfulViewPath  = 'features/claim/payment/claim-fee-payment-unsuccessful';

async function renderView(res: Response, req: any, claim: Claim, claimId: string) {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  res.render(paymentUnsuccessfulViewPath,
    {
      paymentUnsuccessfulBody: getPaymentUnsuccessfulBodyContent(claim, getLng(lang), claimId),
    });
}

paymentUnsuccessfulController.get(PAY_CLAIM_FEE_UNSUCCESSFUL_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const paymentRedirectInformation = await getFeePaymentRedirectInformation(claimId, FeeType.CLAIMISSUED , req);
    const claim =  await getCaseDataFromStore(generateRedisKey(req));
    claim.claimDetails.claimFeePayment=paymentRedirectInformation;
    await saveDraftClaim(claim.id, claim, true);
    await renderView(res, req, claim, claimId);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default paymentUnsuccessfulController;
