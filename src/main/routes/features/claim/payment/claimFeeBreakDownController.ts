import { AppRequest } from 'common/models/AppRequest';
import {NextFunction,RequestHandler, Response, Router} from 'express';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {CLAIM_FEE_BREAKUP} from 'routes/urls';
import {YesNo} from 'common/form/models/yesNo';
import {calculateInterestToDate} from 'common/utils/interestUtils';
import {convertToPoundsFilter} from 'common/utils/currencyFormat';
import {getFeePaymentRedirectInformation} from 'services/features/feePayment/feePaymentService';
import {FeeType} from 'form/models/helpWithFees/feeType';

const claimFeeBreakDownController = Router();
const viewPath = 'features/claim/payment/claim-fee-breakdown';

claimFeeBreakDownController.get(CLAIM_FEE_BREAKUP, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claim =  await getCaseDataFromStore(generateRedisKey(req));
    const claimFee = convertToPoundsFilter(claim.claimFee?.calculatedAmountInPence);
    const hasInterest = claim.claimInterest === YesNo.YES;
    const interestAmount = calculateInterestToDate(claim);
    const totalAmount = hasInterest ? (claim.totalClaimAmount + interestAmount + claimFee) : (claim.totalClaimAmount + claimFee);
    return res.render(viewPath, { totalClaimAmount: claim.totalClaimAmount, interest: interestAmount, claimFee, hasInterest, totalAmount});
  } catch (error) {
    next(error);
  }
})as RequestHandler);

claimFeeBreakDownController.post(CLAIM_FEE_BREAKUP, async (req:   AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const paymentRedirectInformation = await getFeePaymentRedirectInformation(claimId, FeeType.CLAIMISSUED , req);
    const claim =  await getCaseDataFromStore(generateRedisKey(req));
    claim.claimDetails.claimFeePayment=paymentRedirectInformation;
    await saveDraftClaim(claim.id, claim, true);
    res.redirect(paymentRedirectInformation?.nextUrl);
  } catch (error) {
    next(error);
  }
});

export default claimFeeBreakDownController;
