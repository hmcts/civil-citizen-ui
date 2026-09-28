import {AppRequest} from 'models/AppRequest';
import {getFeePaymentRedirectInformation} from 'services/features/feePayment/feePaymentService';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {generateRedisKey, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {TTLCategory} from 'modules/draft-store/ttlConfig';
import {getClaimById} from 'modules/utilityService';
import {isDraftClaimDatabaseEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import {Claim} from 'models/claim';
import {getClaimIssuePaymentClaim} from 'routes/features/claim/payment/claimIssuePaymentDraftService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('ClaimFeeMakePaymentAgainService');

export const getRedirectUrl = async (claimId: string, req: AppRequest): Promise<string> => {
  try {
    const paymentRedirectInformation = await getFeePaymentRedirectInformation(claimId, FeeType.CLAIMISSUED, req);
    let claim: Claim;
    let draftId: string | undefined;
    if (await isDraftClaimDatabaseEnabled()) {
      ({claim, draftId} = await getClaimIssuePaymentClaim(req));
    } else {
      claim = await getClaimById(claimId, req, true);
    }
    if (!claim.claimDetails) {
      claim.claimDetails = new ClaimDetails();
    }
    claim.claimDetails.claimFeePayment = paymentRedirectInformation;
    if (draftId) {
      await updateDraftClaim(req, claim, draftId);
    } else {
      await saveDraftClaim(
        generateRedisKey(req),
        claim,
        true,
        req.session.user?.id,
        TTLCategory.JOURNEY_CACHE,
      );
    }
    return paymentRedirectInformation?.nextUrl;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
