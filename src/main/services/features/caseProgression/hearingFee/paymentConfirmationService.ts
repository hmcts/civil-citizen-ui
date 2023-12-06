import {AppRequest} from 'models/AppRequest';

import {saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import {DASHBOARD_CLAIMANT_URL, PAY_HEARING_FEE_UNSUCCESSFUL_URL} from 'routes/urls';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {getFeePaymentStatus} from 'services/features/feePayment/feePaymentService';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {Claim} from 'models/claim';

const paymentInformation = 'paymentInformation';
const hearing = 'hearing';
const success = 'Success';


export const getRedirectUrl = async (claimId: string, req: AppRequest): Promise<string> => {

  const redisClaimId = generateRedisKey(<AppRequest>req);
  const claim: Claim = await getCaseDataFromStore(redisClaimId);
  const paymentReference = claim.caseProgression.hearing.paymentInformation?.paymentReference;

  const paymentStatus = await getFeePaymentStatus(paymentReference, FeeType.HEARING, req);

  await saveCaseProgression(redisClaimId, paymentStatus, paymentInformation, hearing);

  const redirectUrl = paymentStatus.status === success ? DASHBOARD_CLAIMANT_URL : PAY_HEARING_FEE_UNSUCCESSFUL_URL;
  return redirectUrl;
};
