import {AppRequest} from 'models/AppRequest';
import {
  PAY_CLAIM_FEE_SUCCESSFUL_URL,
  PAY_CLAIM_FEE_UNSUCCESSFUL_URL,
  DASHBOARD_URL,
} from 'routes/urls';
import { deleteDraftClaimFromStore, generateRedisKey, getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import {getFeePaymentStatus} from 'services/features/feePayment/feePaymentService';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {Claim} from 'models/claim';
import { ClaimBilingualLanguagePreference } from 'common/models/claimBilingualLanguagePreference';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimFeePaymentConfirmationService');

const success = 'Success';
const paymentCancelledByUser = 'Payment was cancelled by the user';

export const getRedirectUrl = async (claimId: string, req: AppRequest): Promise<string> => {
  try {
    const redisClaimId = generateRedisKey(req);
    logger.info(`claim id ${redisClaimId}`);
    const claim: Claim = await getCaseDataFromStore(redisClaimId);
    const internalRef = req.params.uniqueId;
    const paymentInfo = claim.claimDetails?.claimFeePayment;
    logger.info(`payment info from redis for claim id ${req.params.id} and internal ref ${req.params.uniqueId}: ${JSON.stringify(paymentInfo)}`);
    logger.info(`claim from redis for claim id ${req.params.id} and internal ref ${req.params.uniqueId}: ${JSON.stringify(claim)}`);
    const paymentStatus = await getFeePaymentStatus(claimId, internalRef, FeeType.CLAIMISSUED, req);
    logger.info(`payment status from service for claim id ${req.params.id}: ${JSON.stringify(paymentStatus)}`);
    if(paymentStatus.status === success) {
      const lang = claim.claimantBilingualLanguagePreference === ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH ? 'cy' : 'en';
      await deleteDraftClaimFromStore(redisClaimId);
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
