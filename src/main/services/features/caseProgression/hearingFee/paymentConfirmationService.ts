import {AppRequest} from 'models/AppRequest';

import {saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import {
  HEARING_FEE_APPLY_HELP_FEE_SELECTION,
  PAY_HEARING_FEE_SUCCESSFUL_URL,
  PAY_HEARING_FEE_UNSUCCESSFUL_URL,
} from 'routes/urls';
import {getFeePaymentStatus} from 'services/features/feePayment/feePaymentService';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {Claim} from 'models/claim';
import {getClaimById} from 'modules/utilityService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('PaymentConfirmationService');

const paymentInformation = 'paymentInformation';
const hearing = 'hearing';
const success = 'Success';
const failed = 'Failed';
const paymentCancelledByUser = 'Payment was cancelled by the user';

export const getRedirectUrl = async (claimId: string, req: AppRequest): Promise<string> => {
  try {
    const claim: Claim = await getClaimById(claimId, req,true);
    const paymentInfo = claim.caseProgression.hearing.paymentInformation;

    const paymentStatus = await getFeePaymentStatus(claimId, paymentInfo.paymentReference, FeeType.HEARING, req);
    paymentInfo.status = paymentStatus.status;
    paymentInfo.errorCode = paymentStatus.errorCode;
    paymentInfo.errorDescription = paymentStatus.errorDescription;
    await saveCaseProgression(req, paymentInfo, paymentInformation, hearing);
    if (paymentStatus.status === success) {
      return PAY_HEARING_FEE_SUCCESSFUL_URL;
    } else if (paymentStatus.status === failed && paymentStatus.errorDescription !== paymentCancelledByUser) {
      return PAY_HEARING_FEE_UNSUCCESSFUL_URL;
    }
    return HEARING_FEE_APPLY_HELP_FEE_SELECTION;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
