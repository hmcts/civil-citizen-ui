
import {AppRequest} from 'models/AppRequest';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getFeePaymentRedirectInformation} from 'services/features/feePayment/feePaymentService';
import {FeeType} from 'form/models/helpWithFees/feeType';

import {saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';

const paymentInformation = 'paymentInformation';
const hearing = 'hearing';
export const getRedirectUrl = async (claimId: string,  req: AppRequest): Promise<string> => {
  const redisClaimId = generateRedisKey(<AppRequest>req);
  const paymentRedirectInformation = await getFeePaymentRedirectInformation(claimId, FeeType.HEARING, req);
  await saveCaseProgression(redisClaimId, paymentRedirectInformation, paymentInformation, hearing);
  return paymentRedirectInformation?.nextUrl;
};
