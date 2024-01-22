import {AppRequest} from 'models/AppRequest';
import {PAY_CLAIM_FEE_SUCCESSFUL_URL, PAY_CLAIM_FEE_UNSUCCESSFUL_URL} from 'routes/urls';
import {deleteDraftClaimFromStore, generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {getFeePaymentStatus} from 'services/features/feePayment/feePaymentService';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {Claim} from 'models/claim';
import {CivilServiceClient} from 'client/civilServiceClient';
import config from 'config';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimFeePaymentConfirmationService');

const success = 'Success';
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const getRedirectUrl = async (claimId: string, req: AppRequest): Promise<string> => {
  try {
    const redisClaimId = generateRedisKey(req);
    const claim: Claim = await getCaseDataFromStore(redisClaimId);
    const paymentInfo = claim.claimDetails?.claimFeePayment;
    const paymentStatus = await getFeePaymentStatus(paymentInfo?.paymentReference, FeeType.CLAIMISSUED, req);
    if(paymentStatus.status === success) {
      claim.issueDate = new Date();
      await deleteDraftClaimFromStore(redisClaimId);
      await civilServiceClient.submitClaimAfterPayment(claimId, claim, req);
      return PAY_CLAIM_FEE_SUCCESSFUL_URL;
    }
    
    return PAY_CLAIM_FEE_UNSUCCESSFUL_URL;
  }
  catch (error) {
    logger.error(error);
    throw error;
  }
};
