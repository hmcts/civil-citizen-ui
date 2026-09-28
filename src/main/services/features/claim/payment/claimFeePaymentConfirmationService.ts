import {AppRequest} from 'models/AppRequest';
import {
  PAY_CLAIM_FEE_SUCCESSFUL_URL,
  PAY_CLAIM_FEE_UNSUCCESSFUL_URL,
  DASHBOARD_URL,
} from 'routes/urls';
import {getFeePaymentStatus} from 'services/features/feePayment/feePaymentService';
import {FeeType} from 'form/models/helpWithFees/feeType';
import { ClaimBilingualLanguagePreference } from 'common/models/claimBilingualLanguagePreference';
import {isDraftClaimDatabaseEnabled, isWelshEnabledForMainCase} from '../../../../app/auth/launchdarkly/launchDarklyClient';
import {isUsablePathSegment} from 'common/utils/routeParamUtils';
import {deleteDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {deleteDraftClaimFromStore, generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {getClaimIssuePaymentClaim} from 'routes/features/claim/payment/claimIssuePaymentDraftService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimFeePaymentConfirmationService');

const success = 'Success';
const paymentCancelledByUser = 'Payment was cancelled by the user';

export const getRedirectUrl = async (claimId: string, req: AppRequest): Promise<string> => {
  try {
    let claim: Claim;
    let draftId: string | undefined;
    if (await isDraftClaimDatabaseEnabled()) {
      ({claim, draftId} = await getClaimIssuePaymentClaim(req));
    } else {
      claim = await getClaimById(claimId, req, true);
    }
    const paymentInfo = claim.claimDetails?.claimFeePayment;
    const paymentReference = paymentInfo?.paymentReference;
    if (!isUsablePathSegment(paymentReference)) {
      return PAY_CLAIM_FEE_UNSUCCESSFUL_URL;
    }
    const paymentStatus = await getFeePaymentStatus(claimId, paymentReference, FeeType.CLAIMISSUED, req);

    if(paymentStatus.status === success) {
      const isCUIWelshEnabled = await isWelshEnabledForMainCase();
      const lang = claim.claimantBilingualLanguagePreference === ClaimBilingualLanguagePreference.WELSH
      || (!isCUIWelshEnabled && claim.claimantBilingualLanguagePreference === ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH) ? 'cy' : 'en';
      if (draftId) {
        await deleteDraftClaim(req, draftId);
        if (req.session) {
          delete req.session.draftId;
        }
      } else {
        await deleteDraftClaimFromStore(generateRedisKey(req));
      }
      return `${PAY_CLAIM_FEE_SUCCESSFUL_URL}?lang=${lang}`;
    }
    return paymentStatus.errorDescription !== paymentCancelledByUser ?
      PAY_CLAIM_FEE_UNSUCCESSFUL_URL : DASHBOARD_URL;
  }
  catch (error) {
    logger.error(error);
    throw error;
  }
};
