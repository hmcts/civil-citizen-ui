import {NextFunction, RequestHandler, Response, Router} from 'express';
import {DASHBOARD_CLAIMANT_URL, PAY_CLAIM_FEE_UNSUCCESSFUL_URL,} from 'routes/urls';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim,} from 'modules/draft-store/draftStoreService';
import {getFeePaymentRedirectInformation} from 'services/features/feePayment/feePaymentService';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const paymentUnsuccessfulController: Router = Router();

const paymentUnsuccessfulViewPath  = 'features/caseProgression/hearingFee/payment-unsuccessful';

async function renderView(res: Response, req: AppRequest, claim: Claim, claimId: string) {
  const claimNumber = claim.getFormattedCaseReferenceNumber(claimId);
  const url = claim.claimDetails.claimFeePayment;
  res.render(paymentUnsuccessfulViewPath,
    {
      claimNumber,
      url,
    });
}

paymentUnsuccessfulController.get(PAY_CLAIM_FEE_UNSUCCESSFUL_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const paymentRedirectInformation = await getFeePaymentRedirectInformation(claimId, FeeType.CLAIMISSUED, req);
    const claim = await getCaseDataFromStore(generateRedisKey(req));
    claim.claimDetails.claimFeePayment = paymentRedirectInformation;
    await saveDraftClaim(claim.id, claim, true);
    await renderView(res, req, claim, claimId);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

paymentUnsuccessfulController.post(PAY_CLAIM_FEE_UNSUCCESSFUL_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    res.redirect(constructResponseUrlWithIdParams(req.params.id, DASHBOARD_CLAIMANT_URL));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default paymentUnsuccessfulController;
