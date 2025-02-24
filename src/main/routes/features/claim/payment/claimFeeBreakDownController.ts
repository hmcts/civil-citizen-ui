import {AppRequest} from 'common/models/AppRequest';
import {NextFunction, RequestHandler, Response, Router} from 'express';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {CLAIM_FEE_BREAKUP, CLAIM_FEE_PAYMENT_CONFIRMATION_URL} from 'routes/urls';
import {YesNo} from 'common/form/models/yesNo';
import {calculateInterestToDate} from 'common/utils/interestUtils';
import {convertToPoundsFilter} from 'common/utils/currencyFormat';
import {getFeePaymentRedirectInformation, getFeePaymentStatus} from 'services/features/feePayment/feePaymentService';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {getClaimBusinessProcess, getClaimById} from 'modules/utilityService';
import {claimFeePaymentGuard} from 'routes/guards/claimFeePaymentGuard';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {saveUserId} from 'modules/draft-store/paymentSessionStoreService';
import {PaymentInformation} from 'models/feePayment/paymentInformation';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimFeeBreakDownController');
const claimFeeBreakDownController = Router();
const viewPath = 'features/claim/payment/claim-fee-breakdown';
const success = 'Success';
const failed = 'Failed';

claimFeeBreakDownController.get(CLAIM_FEE_BREAKUP, claimFeePaymentGuard, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    let paymentSyncError = false;
    if (claim.paymentSyncError) {
      paymentSyncError = true;
      claim.paymentSyncError = undefined;
      await saveDraftClaim(generateRedisKey(<AppRequest>req), claim);
    }
    const claimFee = convertToPoundsFilter(claim.claimFee?.calculatedAmountInPence);
    const hasInterest = claim.claimInterest === YesNo.YES;
    const interestAmount = hasInterest ? await calculateInterestToDate(claim) : 0;
    const totalAmount = hasInterest ? (claim.totalClaimAmount + interestAmount + claimFee) : (claim.totalClaimAmount + claimFee);

    const businessProcess = await getClaimBusinessProcess(req.params.id, req);
    const hasBusinessProcessFinished = businessProcess.hasBusinessProcessFinished() || false;

    return res.render(viewPath, {
      totalClaimAmount: claim.totalClaimAmount?.toFixed(2),
      interest: interestAmount,
      claimFee,
      hasInterest,
      totalAmount: totalAmount?.toFixed(2),
      pageTitle: 'PAGES.FEE_AMOUNT.TITLE',
      paymentSyncError,
      hasBusinessProcessFinished,
    });
  } catch (error) {
    next(error);
  }
})as RequestHandler);

claimFeeBreakDownController.post(CLAIM_FEE_BREAKUP, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(redisKey);
    let paymentRedirectInformation: PaymentInformation;
    if (claim.claimDetails?.claimFeePayment?.paymentReference) {
      paymentRedirectInformation = claim.claimDetails.claimFeePayment;
      logger.info(`existing payment ref found for claim id ${claimId}: ${claim.claimDetails.claimFeePayment.paymentReference}`);
    } else {
      paymentRedirectInformation = await getRedirectInformation(req);
      claim.claimDetails.claimFeePayment = paymentRedirectInformation;
    }
    if (!paymentRedirectInformation) {
      res.redirect(constructResponseUrlWithIdParams(claimId, CLAIM_FEE_BREAKUP));
    } else {
      logger.info('redis key before saving the payment ' + redisKey);
      logger.info('saved redis payment reference ' + claim.claimDetails?.claimFeePayment?.paymentReference);
      await saveDraftClaim(redisKey, claim, true);
      await saveUserId(claimId, req.session.user.id);
      try {
        const paymentStatus = await getFeePaymentStatus(claimId, paymentRedirectInformation?.paymentReference, FeeType.CLAIMISSUED, req);
        logger.info(`Existing payment status for claim id ${claimId}: ${paymentStatus?.status}`);
        if (paymentStatus?.status === success) {
          logger.info(`Redirecting to claim fee payment confirmation url for claim id ${claimId}`);
          res.redirect(constructResponseUrlWithIdParams(claimId, CLAIM_FEE_PAYMENT_CONFIRMATION_URL));
        } else if (paymentStatus?.status === failed) {
          paymentRedirectInformation = await getRedirectInformation(req);
          logger.info(`New payment ref after failed payment for claim id ${claimId}: ${paymentRedirectInformation?.paymentReference}`);
          if (!paymentRedirectInformation) {
            res.redirect(constructResponseUrlWithIdParams(claimId, CLAIM_FEE_BREAKUP));
          } else {
            claim.claimDetails.claimFeePayment = paymentRedirectInformation;
            await saveDraftClaim(redisKey, claim, true);
            res.redirect(paymentRedirectInformation?.nextUrl);
          }
        } else {
          res.redirect(paymentRedirectInformation?.nextUrl);
        }
      } catch (err: unknown) {
        logger.info(`Error retrieving payment status for claim id ${claimId}, payment ref ${paymentRedirectInformation?.paymentReference}`);
        res.redirect(paymentRedirectInformation?.nextUrl);
      }
    }
  } catch (error) {
    logger.info('error from claim fee breakdown controller ' + JSON.stringify(error));
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
    await saveDraftClaim(generateRedisKey(<AppRequest>req), claim, true);
    return null;
  }
}

export default claimFeeBreakDownController;
