import {AppRequest} from 'models/AppRequest';
import {
  PAY_CLAIM_FEE_SUCCESSFUL_URL,
  PAY_CLAIM_FEE_UNSUCCESSFUL_URL,
  DASHBOARD_URL,
} from 'routes/urls';
import {deleteDraftClaim, getDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {getFeePaymentStatus} from 'services/features/feePayment/feePaymentService';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {Claim} from 'models/claim';
import { ClaimBilingualLanguagePreference } from 'common/models/claimBilingualLanguagePreference';
import {isWelshEnabledForMainCase} from '../../../../app/auth/launchdarkly/launchDarklyClient';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimFeePaymentConfirmationService');

const success = 'Success';
const paymentCancelledByUser = 'Payment was cancelled by the user';

export const getRedirectUrl = async (claimId: string, req: AppRequest): Promise<string> => {
  try {
    const claim: Claim = await getDraftClaim(req);
    const paymentInfo = claim.claimDetails?.claimFeePayment;
    logger.info(`Payment information retrieved for claim id ${req.params.id}`);
    const paymentStatus = await getFeePaymentStatus(claimId, paymentInfo?.paymentReference, FeeType.CLAIMISSUED, req);
    logger.info(`Payment status retrieved for claim id ${req.params.id}: ${paymentStatus.status}`);
    if(paymentStatus.status === success) {
      const isCUIWelshEnabled = await isWelshEnabledForMainCase();
      const lang = claim.claimantBilingualLanguagePreference === ClaimBilingualLanguagePreference.WELSH
      || (!isCUIWelshEnabled && claim.claimantBilingualLanguagePreference === ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH) ? 'cy' : 'en';
      const draftId = req.session?.draftId;
      if (draftId) {
        await deleteDraftClaim(req, draftId);
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
