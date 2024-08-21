import {AppRequest} from 'common/models/AppRequest';
import {NextFunction, RequestHandler, Response, Router} from 'express';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {CLAIM_FEE_BREAKUP} from 'routes/urls';
import {YesNo} from 'common/form/models/yesNo';
import {calculateInterestToDate} from 'common/utils/interestUtils';
import {convertToPoundsFilter} from 'common/utils/currencyFormat';
import {getFeePaymentRedirectInformation} from 'services/features/feePayment/feePaymentService';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {getClaimById} from 'modules/utilityService';
import {claimFeePaymentGuard} from 'routes/guards/claimFeePaymentGuard';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const claimFeeBreakDownController = Router();
const viewPath = 'features/claim/payment/claim-fee-breakdown';

claimFeeBreakDownController.get(CLAIM_FEE_BREAKUP, claimFeePaymentGuard, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claim = await getClaimById(req.params.id, req, true);
    let paymentSyncError = false;
    if (claim.paymentSyncError) {
      paymentSyncError = true;
      claim.paymentSyncError = undefined;
      await saveDraftClaim(claim.id, claim);
    }
    const claimFee = convertToPoundsFilter(claim.claimFee?.calculatedAmountInPence);
    const hasInterest = claim.claimInterest === YesNo.YES;
    const interestAmount = calculateInterestToDate(claim);
    const totalAmount = hasInterest ? (claim.totalClaimAmount + interestAmount + claimFee) : (claim.totalClaimAmount + claimFee);
    return res.render(viewPath, {
      totalClaimAmount: claim.totalClaimAmount?.toFixed(2),
      interest: interestAmount,
      claimFee,
      hasInterest,
      totalAmount: totalAmount?.toFixed(2),
      pageTitle: 'PAGES.FEE_AMOUNT.TITLE',
      paymentSyncError,
    });
  } catch (error) {
    next(error);
  }
})as RequestHandler);

claimFeeBreakDownController.post(CLAIM_FEE_BREAKUP, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const paymentRedirectInformation = await getRedirectInformation(req);
    if (!paymentRedirectInformation) {
      res.redirect(constructResponseUrlWithIdParams(claimId, CLAIM_FEE_BREAKUP));
    } else {
      const claim = await getCaseDataFromStore(generateRedisKey(req));
      claim.claimDetails.claimFeePayment = paymentRedirectInformation;
      await saveDraftClaim(claim.id, claim, true);
      res.redirect(paymentRedirectInformation?.nextUrl);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

async function getRedirectInformation(req: AppRequest) {
  try {
    return await getFeePaymentRedirectInformation(
      req.params.id,
      FeeType.CLAIMISSUED,
      req,
    );
  } catch (error) {
    const claim = await getClaimById(req.params.id, req, true);
    claim.paymentSyncError = true;
    await saveDraftClaim(claim.id, claim, true);
    return null;
  }
}

export default claimFeeBreakDownController;
