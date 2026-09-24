import {AppRequest} from 'common/models/AppRequest';
import {NextFunction, RequestHandler, Response, Router} from 'express';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {CLAIM_FEE_BREAKUP, CLAIM_FEE_PAYMENT_CONFIRMATION_URL} from 'routes/urls';
import {YesNo} from 'common/form/models/yesNo';
import {calculateInterestToDate} from 'common/utils/interestUtils';
import {convertToPoundsFilter} from 'common/utils/currencyFormat';
import {getFeePaymentRedirectInformation, getFeePaymentStatus} from 'services/features/feePayment/feePaymentService';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {getClaimBusinessProcess} from 'modules/utilityService';
import {claimFeePaymentGuard} from 'routes/guards/claimFeePaymentGuard';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {saveUserId} from 'modules/draft-store/paymentSessionStoreService';
import {PaymentInformation} from 'models/feePayment/paymentInformation';
import {getRouteParam, isUsablePathSegment} from 'common/utils/routeParamUtils';
import {updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {getClaimIssuePaymentClaim} from './claimIssuePaymentDraftService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimFeeBreakDownController');
const claimFeeBreakDownController = Router();
const viewPath = 'features/claim/payment/claim-fee-breakdown';
const success = 'Success';
const failed = 'Failed';

claimFeeBreakDownController.get(CLAIM_FEE_BREAKUP, claimFeePaymentGuard, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    const {claim, draftId} = await getClaimIssuePaymentClaim(req);
    let paymentSyncError = false;
    if (claim.paymentSyncError) {
      paymentSyncError = true;
      claim.paymentSyncError = undefined;
      await updateDraftClaim(
        req,
        claim,
        draftId,
      );
    }
    const claimFee = convertToPoundsFilter(claim.claimFee?.calculatedAmountInPence);
    const hasInterest = claim.claimInterest === YesNo.YES;
    const interestAmount = hasInterest ? await calculateInterestToDate(claim, req) : 0;
    const totalAmount = hasInterest ? (claim.totalClaimAmount + interestAmount + claimFee) : (claim.totalClaimAmount + claimFee);

    const businessProcess = await getClaimBusinessProcess(claimId, req);
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
    const claimId = getRouteParam(req, 'id');
    const {claim, draftId} = await getClaimIssuePaymentClaim(req);
    if (!claim.claimDetails) {
      claim.claimDetails = new ClaimDetails();
    }
    let paymentRedirectInformation: PaymentInformation;
    if (isUsablePathSegment(claim.claimDetails?.claimFeePayment?.paymentReference)) {
      paymentRedirectInformation = claim.claimDetails.claimFeePayment;
      logger.info(`Existing payment information found for claim id ${claimId}`);
    } else {
      paymentRedirectInformation = await getRedirectInformation(req);
      claim.claimDetails.claimFeePayment = paymentRedirectInformation;
    }
    if (!paymentRedirectInformation) {
      res.redirect(constructResponseUrlWithIdParams(claimId, CLAIM_FEE_BREAKUP));
    } else {
      logger.info(`Saving payment information for claim id ${claimId}`);
      await updateDraftClaim(req, claim, draftId);
      await saveUserId(claimId, FeeType.CLAIMISSUED, req.session.user.id);
      try {
        if (!isUsablePathSegment(paymentRedirectInformation?.paymentReference)) {
          res.redirect(paymentRedirectInformation?.nextUrl);
          return;
        }
        const paymentStatus = await getFeePaymentStatus(claimId, paymentRedirectInformation.paymentReference, FeeType.CLAIMISSUED, req);
        logger.info(`Existing payment status for claim id ${claimId}: ${paymentStatus?.status}`);
        if (paymentStatus?.status === success) {
          logger.info(`Redirecting to claim fee payment confirmation url for claim id ${claimId}`);
          res.redirect(constructResponseUrlWithIdParams(claimId, CLAIM_FEE_PAYMENT_CONFIRMATION_URL));
        } else if (paymentStatus?.status === failed) {
          paymentRedirectInformation = await getRedirectInformation(req);
          logger.info(`New payment information requested after failed payment for claim id ${claimId}`);
          if (!paymentRedirectInformation) {
            res.redirect(constructResponseUrlWithIdParams(claimId, CLAIM_FEE_BREAKUP));
          } else {
            claim.claimDetails.claimFeePayment = paymentRedirectInformation;
            await updateDraftClaim(req, claim, draftId);
            res.redirect(paymentRedirectInformation?.nextUrl);
          }
        } else {
          res.redirect(paymentRedirectInformation?.nextUrl);
        }
      } catch (err: unknown) {
        logger.info(`Error retrieving payment status for claim id ${claimId}`);
        res.redirect(paymentRedirectInformation?.nextUrl);
      }
    }
  } catch (error) {
    logger.error('Error from claim fee breakdown controller', error);
    next(error);
  }
}) as RequestHandler);

async function getRedirectInformation(req: AppRequest) {
  try {
    return await getFeePaymentRedirectInformation(
      getRouteParam(req, 'id'),
      FeeType.CLAIMISSUED,
      req,
    );
  } catch (error) {
    const {claim, draftId} = await getClaimIssuePaymentClaim(req);
    claim.paymentSyncError = true;
    await updateDraftClaim(req, claim, draftId);
    return null;
  }
}

export default claimFeeBreakDownController;
