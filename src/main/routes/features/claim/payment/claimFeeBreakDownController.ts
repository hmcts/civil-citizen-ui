import { AppRequest } from 'common/models/AppRequest';
import {NextFunction, RequestHandler, Response, Router} from 'express';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {CLAIM_FEE_BREAKUP, CLAIM_FEE_URL} from 'routes/urls';
import { YesNo } from 'common/form/models/yesNo';
import { calculateInterestToDate } from 'common/utils/interestUtils';
import {convertToPoundsFilter} from 'common/utils/currencyFormat';

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

export default claimFeeBreakDownController;
