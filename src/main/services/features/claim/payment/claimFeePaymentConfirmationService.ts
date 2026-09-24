import {AppRequest} from 'models/AppRequest';
import {
  PAY_CLAIM_FEE_SUCCESSFUL_URL,
  PAY_CLAIM_FEE_UNSUCCESSFUL_URL,
  DASHBOARD_URL,
} from 'routes/urls';
import {getFeePaymentStatus} from 'services/features/feePayment/feePaymentService';
import {FeeType} from 'form/models/helpWithFees/feeType';
import { ClaimBilingualLanguagePreference } from 'common/models/claimBilingualLanguagePreference';
import {isWelshEnabledForMainCase} from '../../../../app/auth/launchdarkly/launchDarklyClient';
import {isUsablePathSegment} from 'common/utils/routeParamUtils';
import {deleteDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {getClaimIssuePaymentClaim} from 'routes/features/claim/payment/claimIssuePaymentDraftService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimFeePaymentConfirmationService');

const success = 'Success';
const paymentCancelledByUser = 'Payment was cancelled by the user';

export const getRedirectUrl = async (claimId: string, req: AppRequest): Promise<string> => {
  try {
    const {claim, draftId} = await getClaimIssuePaymentClaim(req);
    const paymentInfo = claim.claimDetails?.claimFeePayment;
    const paymentReference = paymentInfo?.paymentReference;
    logger.info(`Payment information retrieved for claim id ${req.params.id}`);
    if (!isUsablePathSegment(paymentReference)) {
      logger.info(`No payment reference for claim id ${req.params.id}`);
      return PAY_CLAIM_FEE_UNSUCCESSFUL_URL;
    }
    const paymentStatus = await getFeePaymentStatus(claimId, paymentReference, FeeType.CLAIMISSUED, req);
    logger.info(`Payment status retrieved for claim id ${req.params.id}: ${paymentStatus.status}`);

    if(paymentStatus.status === success) {
      const isCUIWelshEnabled = await isWelshEnabledForMainCase();
      const lang = claim.claimantBilingualLanguagePreference === ClaimBilingualLanguagePreference.WELSH
      || (!isCUIWelshEnabled && claim.claimantBilingualLanguagePreference === ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH) ? 'cy' : 'en';
      await deleteDraftClaim(req, draftId);
      if (req.session) {
        delete req.session.draftId;
      }
      return `${PAY_CLAIM_FEE_SUCCESSFUL_URL}?lang=${lang}`;
    }
    const redirectingUrl = paymentStatus.errorDescription !== paymentCancelledByUser ?
      PAY_CLAIM_FEE_UNSUCCESSFUL_URL : DASHBOARD_URL;
    logger.info(`redirectingUrl if payment is not success for claim id ${req.params.id}: ${redirectingUrl}`);
    return redirectingUrl;
  }
  catch (error) {
    logger.error(error);
    throw error;
  }
};
