
import {AppRequest} from 'models/AppRequest';
import {getFeePaymentRedirectInformation} from 'services/features/feePayment/feePaymentService';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {FeeType} from 'form/models/helpWithFees/feeType';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('ClaimFeeMakePaymentAgainService');

export const getRedirectUrl = async (claimId: string,  req: AppRequest): Promise<string> => {
  try{
    const paymentRedirectInformation = await getFeePaymentRedirectInformation(claimId, FeeType.CLAIMISSUED, req);
    const claim = await getCaseDataFromStore(generateRedisKey(req));
    claim.claimDetails.claimFeePayment = paymentRedirectInformation;
    await saveDraftClaim(claim.id, claim, true);
    return paymentRedirectInformation?.nextUrl;
  }
  catch (error) {
    logger.error(error);
    throw error;
  }
};
