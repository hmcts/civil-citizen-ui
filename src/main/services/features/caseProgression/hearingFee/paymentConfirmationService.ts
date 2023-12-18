import {AppRequest} from 'models/AppRequest';

import {saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import {
  HEARING_FEE_APPLY_HELP_FEE_SELECTION, PAY_HEARING_FEE_SUCCESSFUL_URL,
  PAY_HEARING_FEE_UNSUCCESSFUL_URL,
} from 'routes/urls';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {getFeePaymentStatus} from 'services/features/feePayment/feePaymentService';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {Claim} from 'models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('PaymentConfirmationService');

const paymentInformation = 'paymentInformation';
const hearing = 'hearing';
const success = 'Success';
const failed = 'Failed';
const paymentCancelledByUser = 'Payment was cancelled by the user';

export const getRedirectUrl = async (claimId: string, req: AppRequest): Promise<string> => {
  try {
    const redisClaimId = generateRedisKey(<AppRequest>req);
    const claim: Claim = await getCaseDataFromStore(redisClaimId);
    const paymentInfo = claim.caseProgression.hearing.paymentInformation;

    const paymentStatus = await getFeePaymentStatus(paymentInfo.paymentReference, FeeType.HEARING, req);
    paymentInfo.status = paymentStatus.status;
    paymentInfo.errorCode = paymentStatus.errorCode;
    paymentInfo.errorDescription = paymentStatus.errorDescription;
    await saveCaseProgression(redisClaimId, paymentInfo, paymentInformation, hearing);

    const redirectUrl = paymentStatus.status === success ? PAY_HEARING_FEE_SUCCESSFUL_URL : paymentStatus.status === failed && paymentStatus.errorDescription !== paymentCancelledByUser? PAY_HEARING_FEE_UNSUCCESSFUL_URL : HEARING_FEE_APPLY_HELP_FEE_SELECTION;
    return redirectUrl;
  }
  catch (error) {
    logger.error(error);
    throw error;
  }
};
