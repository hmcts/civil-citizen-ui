import {AppRequest} from 'models/AppRequest';
import {
  DASHBOARD_URL, GA_PAYMENT_SUCCESSFUL_URL, GA_PAYMENT_UNSUCCESSFUL_URL,
} from 'routes/urls';
import { deleteDraftClaimFromStore, generateRedisKey, getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {Claim} from 'models/claim';
import { ClaimBilingualLanguagePreference } from 'common/models/claimBilingualLanguagePreference';
import { getGaFeePaymentStatus } from '../applicationFee/generalApplicationFeePaymentService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimFeePaymentConfirmationService');

const success = 'Success';
const paymentCancelledByUser = 'Payment was cancelled by the user';

export const getRedirectUrl = async (claimId: string, req: AppRequest): Promise<string> => {
  try {
    const redisClaimId = generateRedisKey(req);
    const claim: Claim = await getCaseDataFromStore(redisClaimId);
    const paymentInfo = claim.generalApplication?.applicationFeePaymentDetails;
    const paymentStatus = await getGaFeePaymentStatus(claimId, paymentInfo?.paymentReference, FeeType.APPLICATION, req);

    if(paymentStatus.status === success) {
      const lang = claim.claimantBilingualLanguagePreference === ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH ? 'cy' : 'en';
      deleteDraftClaimFromStore(redisClaimId);
      return `${GA_PAYMENT_SUCCESSFUL_URL}?lang=${lang}`;
    }

    return paymentStatus.errorDescription !== paymentCancelledByUser ?
      GA_PAYMENT_UNSUCCESSFUL_URL : DASHBOARD_URL;
  }
  catch (error) {
    logger.error(error);
    throw error;
  }
};
