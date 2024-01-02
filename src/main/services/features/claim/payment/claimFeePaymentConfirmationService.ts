import {AppRequest} from 'models/AppRequest';
import {PAY_CLAIM_FEE_SUCCESSFUL_URL, PAY_CLAIM_FEE_UNSUCCESSFUL_URL} from 'routes/urls';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {getFeePaymentStatus} from 'services/features/feePayment/feePaymentService';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {Claim} from 'models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('PaymentConfirmationService');

const success = 'Success';

export const getRedirectUrl = async (claimId: string, req: AppRequest): Promise<string> => {
  try {
    const redisClaimId = generateRedisKey(<AppRequest>req);
    const claim: Claim = await getCaseDataFromStore(redisClaimId);
    const paymentInfo = claim.claimDetails?.claimFeePayment;

    const paymentStatus = await getFeePaymentStatus(paymentInfo.paymentReference, FeeType.CLAIMISSUED, req);
    paymentInfo.status = paymentStatus.status;
    paymentInfo.errorCode = paymentStatus.errorCode;
    paymentInfo.errorDescription = paymentStatus.errorDescription;

    await saveDraftClaim(claim.id, claim, true);

    const redirectUrl = paymentStatus.status === success ? PAY_CLAIM_FEE_SUCCESSFUL_URL : PAY_CLAIM_FEE_UNSUCCESSFUL_URL;
    return redirectUrl;
  }
  catch (error) {
    logger.error(error);
    throw error;
  }
};
