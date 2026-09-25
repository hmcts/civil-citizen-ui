
import {AppRequest} from 'models/AppRequest';
import {getFeePaymentRedirectInformation} from 'services/features/feePayment/feePaymentService';
import {generateRedisKey, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {TTLCategory} from 'modules/draft-store/ttlConfig';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {getClaimById} from 'modules/utilityService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('ClaimFeeMakePaymentAgainService');

export const getRedirectUrl = async (claimId: string,  req: AppRequest): Promise<string> => {
  try {
    const paymentRedirectInformation = await getFeePaymentRedirectInformation(claimId, FeeType.CLAIMISSUED, req);
    const claim = await getClaimById(claimId, req, true);
    if (!claim.claimDetails) {
      claim.claimDetails = new ClaimDetails();
    }
    claim.claimDetails.claimFeePayment = paymentRedirectInformation;
    await saveDraftClaim(
      generateRedisKey(req),
      claim,
      true,
      req.session.user?.id,
      TTLCategory.JOURNEY_CACHE,
    );
    return paymentRedirectInformation?.nextUrl;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
