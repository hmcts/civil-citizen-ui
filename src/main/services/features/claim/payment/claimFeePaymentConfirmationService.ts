import {AppRequest} from 'models/AppRequest';
import {
  PAY_CLAIM_FEE_SUCCESSFUL_URL,
  PAY_CLAIM_FEE_UNSUCCESSFUL_URL,
  DASHBOARD_URL,
} from 'routes/urls';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {getFeePaymentStatus} from 'services/features/feePayment/feePaymentService';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {Claim} from 'models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimFeePaymentConfirmationService');

const success = 'Success';
const paymentCancelledByUser = 'Payment was cancelled by the user';

export const getRedirectUrl = async (claimId: string, req: AppRequest): Promise<string> => {
  try {
    const redisClaimId = generateRedisKey(req);
    const claim: Claim = await getCaseDataFromStore(redisClaimId);
    const paymentInfo = claim.claimDetails?.claimFeePayment;
    const paymentStatus = await getFeePaymentStatus(claimId, paymentInfo?.paymentReference, FeeType.CLAIMISSUED, req);

    if(paymentStatus.status === success) {
      return PAY_CLAIM_FEE_SUCCESSFUL_URL;
    }

    return paymentStatus.errorDescription !== paymentCancelledByUser ?
      PAY_CLAIM_FEE_UNSUCCESSFUL_URL  : DASHBOARD_URL;
  }
  catch (error) {
    logger.error(error);
    throw error;
  }
};
