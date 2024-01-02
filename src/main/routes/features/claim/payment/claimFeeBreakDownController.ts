import { AppRequest } from 'common/models/AppRequest';
import {NextFunction,RequestHandler, Response, Router} from 'express';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import { CLAIM_FEE_BREAKUP, CLAIM_FEE_URL} from 'routes/urls';
import { YesNo } from 'common/form/models/yesNo';
import { calculateInterestToDate } from 'common/utils/interestUtils';
import {convertToPoundsFilter} from 'common/utils/currencyFormat';
import {getFeePaymentRedirectInformation} from 'services/features/feePayment/feePaymentService';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {Claim} from 'models/claim';

const claimFeeBreakDownController = Router();
const viewPath = 'features/claim/payment/claim-fee-breakdown';

claimFeeBreakDownController.get(CLAIM_FEE_BREAKUP, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim =  await getCaseDataFromStore(generateRedisKey(req));
    const claimFee = convertToPoundsFilter(claim.claimFee?.calculatedAmountInPence);
    const hasInterest = claim.claimInterest === YesNo.YES;
    const interestAmount = calculateInterestToDate(claim);
    const totalAmount = hasInterest ? (claim.totalClaimAmount + interestAmount + claimFee) : (claim.totalClaimAmount + claimFee);
    const redirectUrl = CLAIM_FEE_URL.replace(':id', claimId);
    return res.render(viewPath, { totalClaimAmount: claim.totalClaimAmount, interest: interestAmount, claimFee, hasInterest, totalAmount, redirectUrl});
  } catch (error) {
    next(error);
  }
})as RequestHandler);

claimFeeBreakDownController.post(CLAIM_FEE_BREAKUP, async (req:   AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const paymentRedirectInformation = await getFeePaymentRedirectInformation(claimId, FeeType.CLAIMISSUED , req);

    const userId = (<AppRequest>req).session?.user?.id;
    const claim: Claim = await getCaseDataFromStore(userId);
    claim.claimFeePayment=paymentRedirectInformation;
    await saveDraftClaim(claim.id, claim, true);
    return paymentRedirectInformation?.nextUrl;

  } catch (error) {
    next(error);
  }
});

export default claimFeeBreakDownController;
